import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/torneios/[id]/inscricao/verificar - Verify participant OTP code
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { participantId, code } = body;

    if (!participantId || !code) {
      return NextResponse.json(
        { error: "Identificador da inscrição e código de verificação são obrigatórios." },
        { status: 400 }
      );
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!participant || participant.tournamentId !== id) {
      return NextResponse.json(
        { error: "Inscrição não encontrada para este campeonato." },
        { status: 404 }
      );
    }

    if (participant.phoneVerified && participant.status === "CONFIRMED") {
      return NextResponse.json(
        {
          success: true,
          message: "Esta inscrição já está confirmada!",
          participant,
        },
        { status: 200 }
      );
    }

    // Check expiration
    if (participant.codeExpiresAt && new Date(participant.codeExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Código expirado! Solicite um novo código de confirmação." },
        { status: 400 }
      );
    }

    // Check code match (trim & ignore dashes/spaces)
    const cleanInputCode = code.toString().replace(/\D/g, "").trim();
    const cleanSavedCode = (participant.verificationCode || "").replace(/\D/g, "").trim();

    if (cleanInputCode !== cleanSavedCode) {
      return NextResponse.json(
        { error: "Código incorreto! Confira os 6 dígitos digitados." },
        { status: 400 }
      );
    }

    // Mark as confirmed and verified
    const updated = await prisma.participant.update({
      where: { id: participantId },
      data: {
        status: "CONFIRMED",
        phoneVerified: true,
        verificationCode: null,
        codeExpiresAt: null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Inscrição confirmada com sucesso! Vaga garantida na mesa.",
        participant: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao validar código:", error);
    return NextResponse.json(
      { error: "Erro ao validar código: " + error.message },
      { status: 500 }
    );
  }
}
