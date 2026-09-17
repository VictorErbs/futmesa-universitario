import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// Rota GET para listar todos os torneios com a contagem de participantes e partidas
export async function GET() {
  try {
    // Busca a lista de torneios no banco de dados, ordenados pelo mais recente
    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            participants: true,
            matches: true,
          },
        },
      },
    });

    return NextResponse.json(tournaments);
  } catch (error: any) {
    console.error("Erro ao listar torneios:", error);
    return NextResponse.json(
      { error: "Erro ao buscar torneios: " + error.message },
      { status: 500 }
    );
  }
}

// Rota POST para criar um novo torneio
export async function POST(req: NextRequest) {
  try {
    // Extrai o corpo da requisição JSON
    const body = await req.json();
    // Extrai os dados do novo torneio
    const {
      title,
      description,
      modality = "DOUBLES",
      format = "SINGLE_ELIMINATION",
      pointsPerSet = 18,
      maxSets = 3,
      setsToWin,
      advantageRule = true,
      location,
      community,
      sponsors,
      rulesNote,
      startDate,
    } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "O título do torneio é obrigatório." },
        { status: 400 }
      );
    }

    // Define a modalidade garantindo que o valor seja válido (INDIVIDUAL ou DOUBLES)
    const normalizedModality =
      modality === "INDIVIDUAL" || modality === "1x1" ? "INDIVIDUAL" : "DOUBLES";

    // Define o formato do torneio garantindo que o valor seja válido
    const normalizedFormat =
      format === "GRUPOS_E_MATA_MATA" || format === "GROUPS_AND_KNOCKOUT"
        ? "GROUPS_AND_KNOCKOUT"
        : "SINGLE_ELIMINATION";

    // Calcula a quantidade de sets para vencer, caso não seja provida diretamente
    const calculatedSetsToWin =
      setsToWin !== undefined ? Number(setsToWin) : Number(maxSets) === 1 ? 1 : 2;

    // Cria o novo torneio no banco de dados
    const tournament = await prisma.tournament.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        modality: normalizedModality,
        format: normalizedFormat,
        pointsPerSet: Number(pointsPerSet) || 18,
        setsToWin: calculatedSetsToWin,
        advantageRule: Boolean(advantageRule),
        location: location?.trim() || "Quadra Universitária de MesaMatch",
        startDate: startDate ? new Date(startDate) : new Date(),
        status: "REGISTRATION",
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar torneio:", error);
    return NextResponse.json(
      { error: "Erro ao criar torneio: " + error.message },
      { status: 500 }
    );
  }
}
