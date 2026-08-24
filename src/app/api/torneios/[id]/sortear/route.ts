import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  generateSingleEliminationBracket,
  generateGroupsAndRoundRobin,
} from "@/lib/tournament-engine";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/torneios/[id]/sortear - Draw and generate tournament bracket/groups
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Torneio não encontrado." },
        { status: 404 }
      );
    }

    // Only draw confirmed & verified participants
    const participants = tournament.participants.filter(
      (p) => p.status === "CONFIRMED"
    );

    if (participants.length < 2) {
      return NextResponse.json(
        {
          error:
            "São necessários pelo menos 2 participantes com inscrição confirmada e WhatsApp validado para realizar o sorteio.",
        },
        { status: 400 }
      );
    }

    // Shuffle participants randomly for a fair community draw
    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    // Delete previous matches, sets, and groups for clean regeneration
    await prisma.matchSet.deleteMany({
      where: { match: { tournamentId: id } },
    });
    await prisma.match.deleteMany({
      where: { tournamentId: id },
    });
    await prisma.tournamentGroup.deleteMany({
      where: { tournamentId: id },
    });

    const setsCount = tournament.setsToWin === 1 ? 1 : 3;

    if (tournament.format === "GROUPS_AND_KNOCKOUT" && participants.length >= 4) {
      const groupSize = participants.length >= 8 ? 4 : 3;
      const { groups, matches } = generateGroupsAndRoundRobin(
        shuffled,
        groupSize,
        tournament.setsToWin,
        tournament.pointsPerSet
      );

      // Create groups in database
      for (const grp of groups) {
        await prisma.tournamentGroup.create({
          data: {
            tournamentId: id,
            name: grp.name,
          },
        });

        // Update groupName on participants
        for (const p of grp.participants) {
          await prisma.participant.update({
            where: { id: p.id },
            data: { groupName: grp.name },
          });
        }
      }

      // Create group matches
      for (const m of matches) {
        const createdMatch = await prisma.match.create({
          data: {
            tournamentId: id,
            stage: m.stage,
            round: m.round,
            matchNumber: m.matchNumber,
            groupName: m.groupName,
            participant1Id: m.participant1Id,
            participant2Id: m.participant2Id,
            status: "SCHEDULED",
            court: m.court,
          },
        });

        for (let s = 1; s <= setsCount; s++) {
          await prisma.matchSet.create({
            data: {
              matchId: createdMatch.id,
              setNumber: s,
              score1: 0,
              score2: 0,
            },
          });
        }
      }
    } else {
      // SINGLE_ELIMINATION (Mata-Mata)
      const engineMatches = generateSingleEliminationBracket(
        shuffled,
        tournament.setsToWin,
        tournament.pointsPerSet
      );

      // Map generated engine match IDs to real DB match IDs
      const idMap = new Map<string, string>();

      for (const em of engineMatches) {
        const createdMatch = await prisma.match.create({
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
          await prisma.matchSet.create({
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

      // Second pass: link nextMatchId and handle initial BYE auto advances
      for (const em of engineMatches) {
        const realMatchId = idMap.get(em.id);
        const realNextMatchId = em.nextMatchId ? idMap.get(em.nextMatchId) : null;

        if (realMatchId && realNextMatchId) {
          await prisma.match.update({
            where: { id: realMatchId },
            data: {
              nextMatchId: realNextMatchId,
              nextMatchSlot: em.nextMatchSlot,
            },
          });

          // If this was an auto-BYE win, make sure next match has the participant
          if (em.winnerId && em.nextMatchSlot) {
            await prisma.match.update({
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
    }

    // Update tournament status
    await prisma.tournament.update({
      where: { id },
      data: { status: "IN_PROGRESS" },
    });

    return NextResponse.json({
      success: true,
      message: "Sorteio e chaveamento gerados com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao sortear chaves:", error);
    return NextResponse.json(
      { error: "Erro ao gerar chaveamento: " + error.message },
      { status: 500 }
    );
  }
}
