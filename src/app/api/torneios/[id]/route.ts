import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Rota GET para obter os detalhes completos do torneio
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // Obtém o ID do torneio a partir dos parâmetros
    const { id } = await params;

    // Busca o torneio no banco de dados com seus relacionamentos
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: {
          orderBy: [{ seed: "asc" }],
        },
        groups: true,
        matches: {
          include: {
            participant1: true,
            participant2: true,
            winner: true,
            sets: { orderBy: { setNumber: "asc" } },
          },
          orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Torneio não encontrado." },
        { status: 404 }
      );
    }

    // Prepara (hidrata) os grupos com seus respectivos participantes e partidas para facilitar a renderização no frontend
    const formattedGroups = tournament.groups.map((grp) => {
      // Filtra os participantes que pertencem a este grupo
      const groupParticipants = tournament.participants.filter(
        (p) => p.groupName === grp.name
      );
      // Filtra as partidas que pertencem a este grupo
      const groupMatches = tournament.matches.filter(
        (m) => m.groupName === grp.name
      );
      return {
        id: grp.id,
        name: grp.name,
        tournamentId: grp.tournamentId,
        participants: groupParticipants,
        matches: groupMatches,
        createdAt: grp.createdAt,
      };
    });

    return NextResponse.json({
      ...tournament,
      maxSets: tournament.setsToWin === 1 ? 1 : 3,
      groups: formattedGroups,
    });
  } catch (error: any) {
    console.error("Erro ao buscar detalhes do torneio:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes do torneio: " + error.message },
      { status: 500 }
    );
  }
}

// Rota PUT para atualizar os detalhes do torneio
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    // Obtém o ID do torneio a partir dos parâmetros
    const { id } = await params;
    // Extrai o corpo da requisição JSON
    const body = await req.json();
    // Obtém os dados para atualização
    const {
      title,
      description,
      status,
      pointsPerSet,
      setsToWin,
      maxSets,
      location,
      startDate,
      modality,
      format,
    } = body;

    // Atualiza os dados do torneio no banco de dados
    const updated = await prisma.tournament.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(pointsPerSet !== undefined && { pointsPerSet: Number(pointsPerSet) }),
        ...(setsToWin !== undefined && { setsToWin: Number(setsToWin) }),
        ...(maxSets !== undefined && { setsToWin: Number(maxSets) === 1 ? 1 : 2 }),
        ...(location !== undefined && { location: location?.trim() }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(modality !== undefined && { modality }),
        ...(format !== undefined && { format }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Erro ao atualizar torneio:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar torneio: " + error.message },
      { status: 500 }
    );
  }
}

// Rota DELETE para excluir o torneio
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // Obtém o ID do torneio a partir dos parâmetros
    const { id } = await params;

    await prisma.tournament.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Torneio excluído com sucesso." });
  } catch (error: any) {
    console.error("Erro ao deletar torneio:", error);
    return NextResponse.json(
      { error: "Erro ao deletar torneio: " + error.message },
      { status: 500 }
    );
  }
}
