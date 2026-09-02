import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateOtpVerificationWhatsApp } from "@/lib/olinda";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/torneios/[id]/inscricao - Register an athlete/dupla
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      nickname,
      partnerName,
      partnerNickname,
      neighborhood,
      communityOrProject,
      phone,
      email,
    } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "O nome do atleta ou da dupla é obrigatório." },
        { status: 400 }
      );
    }

    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "Informe um número de WhatsApp válido com DDD (ex: 81 99999-9999)." },
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

    const cleanPhone = phone.trim();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Check for existing registration with same phone
    const existing = await prisma.participant.findFirst({
      where: {
        tournamentId: id,
        phone: cleanPhone,
      },
    });

    if (existing && existing.status === "CONFIRMED") {
      return NextResponse.json(
        { error: "Este número de telefone já possui uma inscrição confirmada neste campeonato." },
        { status: 400 }
      );
    }

    let participant;

    if (existing && existing.status === "PENDING") {
      // Re-use and update pending participant with new code
      participant = await prisma.participant.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          nickname: nickname?.trim() || null,
          partnerName: partnerName?.trim() || null,
          partnerNickname: partnerNickname?.trim() || null,
          neighborhood: neighborhood?.trim() || null,
          communityOrProject: communityOrProject?.trim() || null,
          email: email?.trim() || null,
          verificationCode,
          codeExpiresAt,
          phoneVerified: false,
        },
      });
    } else {
      const currentCount = tournament._count.participants;
      participant = await prisma.participant.create({
        data: {
          name: name.trim(),
          nickname: nickname?.trim() || null,
          partnerName: partnerName?.trim() || null,
          partnerNickname: partnerNickname?.trim() || null,
          neighborhood: neighborhood?.trim() || null,
          communityOrProject: communityOrProject?.trim() || null,
          phone: cleanPhone,
          email: email?.trim() || null,
          seed: currentCount + 1,
          status: "PENDING",
          phoneVerified: false,
          verificationCode,
          codeExpiresAt,
          tournamentId: id,
        },
      });
    }

    const athleteDisplayName = participant.nickname
      ? `${participant.name} (${participant.nickname})`
      : participant.name;

    const whatsappUrl = generateOtpVerificationWhatsApp({
      phone: cleanPhone,
      athleteName: athleteDisplayName,
      tournamentTitle: tournament.title,
      code: verificationCode,
    });

    console.log(`[OTP WHATSAPP] Gerado para ${cleanPhone}: ${verificationCode}`);

    return NextResponse.json(
      {
        participantId: participant.id,
        name: participant.name,
        phone: participant.phone,
        whatsappUrl,
        codeExpiresAt,
        message: "Link de verificação gerado para o seu WhatsApp.",
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
