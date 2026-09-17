import { NextRequest, NextResponse } from "next/server";
import { updateMatchScoreAndAdvance } from "@/lib/match-service";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";



interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Apenas administradores podem alterar o placar ao vivo." },
        { status: 403 }
      );
    }

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
