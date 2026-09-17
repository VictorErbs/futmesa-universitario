import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Rota POST para inscrição direta e simplificada no torneio
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    // Obtém o ID do torneio a partir dos parâmetros da rota
    const { id } = await params;
    // Extrai o corpo da requisição JSON
    const body = await req.json();
    // Obtém os dados do participante
    const { name, nickname, neighborhood, communityOrProject, phone } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "O nome do atleta ou da dupla é obrigatório." },
        { status: 400 }
      );
    }

    // Busca o torneio no banco de dados e a contagem de inscritos
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

    if (tournament.status === "FINALIZADO" || tournament.status === "FINISHED") {
      return NextResponse.json(
        { error: "As inscrições para este torneio estão encerradas." },
        { status: 400 }
      );
    }

    // Guarda a quantidade atual de participantes para definir o 'seed' (número de inscrição)
    const currentCount = tournament._count.participants;

    // Cria o novo participante no banco de dados
    const participant = await prisma.participant.create({
      data: { 
        name: name.trim(),
        nickname: nickname?.trim() || null,
        neighborhood: neighborhood?.trim() || null,
        communityOrProject: communityOrProject?.trim() || null,
        phone: phone?.trim() || null,
        seed: currentCount + 1,
        tournamentId: id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Inscrição realizada com sucesso!",
        participant,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro ao registrar inscrição:", error);
    return NextResponse.json(
      { error: "Erro ao registrar inscrição: " + error.message },
      { status: 500 }
    );
  }
}
