import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import {
  calculateGroupStandings,
  qualifyTopTeamsToKnockout,
  StandingsResult,
} from "@/lib/tournament-engine";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Apenas administradores podem gerar o mata-mata." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: true,
        groups: true,
        matches: {
          include: { sets: true },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Torneio não encontrado." },
        { status: 404 }
      );
    }

    if (tournament.groups.length === 0) {
      return NextResponse.json(
        { error: "Este torneio não possui grupos sorteados." },
        { status: 400 }
      );
    }

    const standingsByGroup: Record<string, StandingsResult[]> = {};
    for (const grp of tournament.groups) {
      const grpParticipants = tournament.participants.filter(
        (p) => p.groupName === grp.name
      );
      const grpMatches = tournament.matches.filter(
        (m) => m.groupName === grp.name && m.stage === "GROUPS"
      );
      standingsByGroup[grp.name] = calculateGroupStandings(
        grpParticipants,
        grpMatches,
        tournament.pointsPerSet,
        tournament.advantageRule
      );
    }

    const playoffMatches = qualifyTopTeamsToKnockout(
      standingsByGroup,
      tournament.setsToWin,
      tournament.pointsPerSet
    );

    if (playoffMatches.length === 0) {
      return NextResponse.json(
        { error: "Não há classificados suficientes para gerar o mata-mata." },
        { status: 400 }
      );
    }

    const setsCount = tournament.setsToWin === 1 ? 1 : 3;

    await prisma.$transaction(async (tx) => {
      // Remove apenas partidas eliminatórias anteriores (preserva a fase de grupos)
      await tx.matchSet.deleteMany({
        where: {
          match: {
            tournamentId: id,
            stage: { not: "GROUPS" },
          },
        },
      });
      await tx.match.deleteMany({
        where: {
          tournamentId: id,
          stage: { not: "GROUPS" },
        },
      });

      const idMap = new Map<string, string>();

      for (const em of playoffMatches) {
        const createdMatch = await tx.match.create({
          data: {
            tournamentId: id,
            stage: em.stage,
            round: em.round,
            matchNumber: em.matchNumber,
            participant1Id: em.participant1Id,
            participant2Id: em.participant2Id,
            winnerId: em.winnerId,
            status: em.status,
            court: em.court,
          },
        });

        idMap.set(em.id, createdMatch.id);

        for (let s = 1; s <= setsCount; s++) {
          await tx.matchSet.create({
            data: {
              matchId: createdMatch.id,
              setNumber: s,
              score1: 0,
              score2: 0,
              isFinished: em.status === "FINISHED",
            },
          });
        }
      }

      for (const em of playoffMatches) {
        const realMatchId = idMap.get(em.id);
        const realNextMatchId = em.nextMatchId ? idMap.get(em.nextMatchId) : null;

        if (realMatchId && realNextMatchId) {
          await tx.match.update({
            where: { id: realMatchId },
            data: {
              nextMatchId: realNextMatchId,
              nextMatchSlot: em.nextMatchSlot,
            },
          });

          if (em.winnerId && em.nextMatchSlot) {
            await tx.match.update({
              where: { id: realNextMatchId },
              data: {
                ...(em.nextMatchSlot === 1
                  ? { participant1Id: em.winnerId }
                  : { participant2Id: em.winnerId }),
              },
            });
          }
        }
      }

      await tx.tournament.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Mata-mata gerado com os classificados dos grupos!",
    });
  } catch (error: any) {
    console.error("Erro ao gerar mata-mata:", error);
    return NextResponse.json(
      { error: "Erro ao gerar mata-mata: " + error.message },
      { status: 500 }
    );
  }
}
