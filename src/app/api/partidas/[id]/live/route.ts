import { NextRequest, NextResponse } from "next/server";
import { updateMatchScoreAndAdvance } from "@/lib/match-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/partidas/[id]/live - Live point-by-point update from digital scoreboard
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { setNumber = 1, score1 = 0, score2 = 0 } = body;

    const result = await updateMatchScoreAndAdvance(id, [
      {
        setNumber: Number(setNumber),
        score1: Number(score1),
        score2: Number(score2),
      },
    ]);

    return NextResponse.json({
      success: true,
      match: result.match,
      evaluation: result.evaluation,
      maxScore: result.maxScore,
    });
  } catch (error: any) {
    console.error("Erro no placar ao vivo:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar placar ao vivo: " + error.message },
      { status: 500 }
    );
  }
}
