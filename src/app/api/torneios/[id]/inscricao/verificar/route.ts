import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Rota POST para verificar o código numérico (OTP) do participante
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    // Obtém o ID do torneio a partir dos parâmetros
    const { id } = await params;
    // Obtém os dados enviados no corpo da requisição
    const body = await req.json();
    // Extrai o ID do participante e o código
    const { participantId, code } = body;

    if (!participantId || !code) {
      return NextResponse.json(
        { error: "Identificador da inscrição e código de verificação são obrigatórios." },
        { status: 400 }
      );
    }

    // Busca a inscrição do participante no banco de dados
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

    // Verifica se o tempo de validade do código já expirou
    if (participant.codeExpiresAt && new Date(participant.codeExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Código expirado! Solicite um novo código de confirmação." },
        { status: 400 }
      );
    }

    // Verifica se os códigos batem (ignora espaços, traços e foca só nos números)
    // Limpa o código digitado
    const cleanInputCode = code.toString().replace(/\D/g, "").trim();
    // Limpa o código salvo no banco de dados
    const cleanSavedCode = (participant.verificationCode || "").replace(/\D/g, "").trim();

    if (cleanInputCode !== cleanSavedCode) {
      return NextResponse.json(
        { error: "Código incorreto! Confira os 6 dígitos digitados." },
        { status: 400 }
      );
    }

    // Marca o participante como confirmado e com telefone verificado
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
