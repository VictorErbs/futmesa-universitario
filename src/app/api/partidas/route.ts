import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Apenas administradores podem criar partidas." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { tournamentId, participant1Id, participant2Id, court, stage } = body;

    if (!tournamentId) {
      return NextResponse.json(
        { error: "tournamentId é obrigatório." },
        { status: 400 }
      );
    }

    const match = await prisma.match.create({
      data: {
        tournamentId,
        participant1Id: participant1Id || null,
        participant2Id: participant2Id || null,
        court: court || "Mesa 1",
        stage: stage || "AVULSA",
        status: "SCHEDULED",
        sets: {
          create: [{ setNumber: 1, score1: 0, score2: 0 }],
        },
      },
      include: {
        participant1: true,
        participant2: true,
        sets: true,
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao criar partida: " + error.message },
      { status: 500 }
    );
  }
}