import { NextRequest, NextResponse } from "next/server";
import { updateMatchScoreAndAdvance, SetScoreInput } from "@/lib/match-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/partidas/[id]/resultado - Save match result, update database and propagate winner
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { sets, setNumber, score1, score2, isFinished } = body;

    let setsInput: SetScoreInput[] = [];

    if (Array.isArray(sets) && sets.length > 0) {
      setsInput = sets.map((s: any) => ({
        setNumber: Number(s.setNumber) || 1,
        score1: Number(s.score1) || 0,
        score2: Number(s.score2) || 0,
        isFinished: s.isFinished !== undefined ? Boolean(s.isFinished) : undefined,
      }));
    } else if (setNumber !== undefined) {
      setsInput = [
        {
          setNumber: Number(setNumber) || 1,
          score1: Number(score1) || 0,
          score2: Number(score2) || 0,
          isFinished: isFinished !== undefined ? Boolean(isFinished) : undefined,
        },
      ];
    } else {
      return NextResponse.json(
        { error: "Dados de pontuação inválidos. Informe sets ou setNumber, score1, score2." },
        { status: 400 }
      );
    }

    const result = await updateMatchScoreAndAdvance(id, setsInput);

    return NextResponse.json({
      success: true,
      match: result.match,
      evaluation: result.evaluation,
      maxScore: result.maxScore,
    });
  } catch (error: any) {
    console.error("Erro ao registrar resultado:", error);
    return NextResponse.json(
      { error: "Erro ao salvar resultado: " + error.message },
      { status: 500 }
    );
  }
}
