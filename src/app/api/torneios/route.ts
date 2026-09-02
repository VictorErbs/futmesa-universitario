import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/torneios - List all tournaments with participant & match counts
export async function GET() {
  try {
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

// POST /api/torneios - Create a new tournament
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
      startDate,
    } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "O título do torneio é obrigatório." },
        { status: 400 }
      );
    }

    const normalizedModality =
      modality === "INDIVIDUAL" || modality === "1x1" ? "INDIVIDUAL" : "DOUBLES";

    const normalizedFormat =
      format === "GRUPOS_E_MATA_MATA" || format === "GROUPS_AND_KNOCKOUT"
        ? "GROUPS_AND_KNOCKOUT"
        : "SINGLE_ELIMINATION";

    const calculatedSetsToWin =
      setsToWin !== undefined ? Number(setsToWin) : Number(maxSets) === 1 ? 1 : 2;

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
