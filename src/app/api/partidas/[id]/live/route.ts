import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/partidas/[id]/live - Live point-by-point update from digital scoreboard
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { setNumber = 1, score1 = 0, score2 = 0 } = body;

    const match = await prisma.match.findUnique({
      where: { id },
      include: { sets: true },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Partida não encontrada." },
        { status: 404 }
      );
    }

    // If match was scheduled, mark it as in progress (live)
    if (match.status === "SCHEDULED" || match.status === "AGENDADA") {
      await prisma.match.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
      });
    }

    // Upsert the specific set score
    const existingSet = match.sets.find((s) => s.setNumber === Number(setNumber));

    if (existingSet) {
      await prisma.matchSet.update({
        where: { id: existingSet.id },
        data: {
          score1: Number(score1),
          score2: Number(score2),
        },
      });
    } else {
      await prisma.matchSet.create({
        data: {
          matchId: id,
          setNumber: Number(setNumber),
          score1: Number(score1),
          score2: Number(score2),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no placar ao vivo:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar placar ao vivo: " + error.message },
      { status: 500 }
    );
  }
}
