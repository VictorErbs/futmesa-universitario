import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/torneios/[id]/inscricao - Register an athlete/dupla
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, partnerName, phone, email } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "O nome do atleta ou da dupla é obrigatório." },
        { status: 400 }
      );
    }

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        _count: { select: { participants: true } },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Torneio não encontrado." },
        { status: 404 }
      );
    }

    if (tournament.status === "FINALIZADO" || tournament.status === "CANCELADO") {
      return NextResponse.json(
        { error: "As inscrições para este torneio estão encerradas." },
        { status: 400 }
      );
    }

    const currentCount = tournament._count.participants;

    const participant = await prisma.participant.create({
      data: {
        name: name.trim(),
        partnerName: partnerName?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        seed: currentCount + 1,
        status: "CONFIRMADO",
        tournamentId: id,
      },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao registrar inscrição:", error);
    return NextResponse.json(
      { error: "Erro ao registrar inscrição: " + error.message },
      { status: 500 }
    );
  }
}
