import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { evaluateMatchWinner } from "@/lib/tournament-engine";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/partidas/[id]/resultado - Save match result and propagate winner
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { sets } = body; // Array of { setNumber, score1, score2, isFinished }

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        tournament: true,
        sets: true,
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Partida não encontrada." },
        { status: 404 }
      );
    }

    const pointsPerSet = match.tournament.pointsPerSet;
    const setsToWin = match.tournament.setsToWin;
    const advantageRule = match.tournament.advantageRule;

    // Upsert or update each set
    if (Array.isArray(sets)) {
      for (const s of sets) {
        const existingSet = match.sets.find((es) => es.setNumber === Number(s.setNumber));
        if (existingSet) {
          await prisma.matchSet.update({
            where: { id: existingSet.id },
            data: {
              score1: Number(s.score1) || 0,
              score2: Number(s.score2) || 0,
              isFinished: Boolean(s.isFinished),
            },
          });
        } else {
          await prisma.matchSet.create({
            data: {
              matchId: id,
              setNumber: Number(s.setNumber),
              score1: Number(s.score1) || 0,
              score2: Number(s.score2) || 0,
              isFinished: Boolean(s.isFinished),
            },
          });
        }
      }
    }

    // Fetch updated sets to evaluate match winner
    const updatedSets = await prisma.matchSet.findMany({
      where: { matchId: id },
      orderBy: { setNumber: "asc" },
    });

    const evaluation = evaluateMatchWinner(
      updatedSets,
      setsToWin,
      pointsPerSet,
      advantageRule
    );

    let winnerId: string | null = null;
    let newStatus = match.status;

    if (evaluation.isFinished && evaluation.winnerSlot) {
      winnerId = evaluation.winnerSlot === 1 ? match.participant1Id : match.participant2Id;
      newStatus = "FINISHED";
    }

    // Update match
    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        winnerId,
        status: newStatus,
      },
      include: {
        participant1: true,
        participant2: true,
        winner: true,
        sets: true,
      },
    });

    // If there is a winner and a next match in the knockout bracket, propagate!
    if (winnerId && match.nextMatchId && match.nextMatchSlot) {
      const slotData =
        match.nextMatchSlot === 1
          ? { participant1Id: winnerId }
          : { participant2Id: winnerId };

      await prisma.match.update({
        where: { id: match.nextMatchId },
        data: slotData,
      });
    }

    return NextResponse.json({
      success: true,
      match: updatedMatch,
      evaluation,
    });
  } catch (error: any) {
    console.error("Erro ao registrar resultado:", error);
    return NextResponse.json(
      { error: "Erro ao salvar resultado: " + error.message },
      { status: 500 }
    );
  }
}
