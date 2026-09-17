import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  generateSingleEliminationBracket,
  generateGroupsAndRoundRobin,
} from "@/lib/tournament-engine";
import { isAdmin } from "@/lib/auth";

// Define os parâmetros da rota
interface RouteParams {
  params: Promise<{ id: string }>;
}

// Rota POST para realizar o sorteio do torneio
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    // Verifica se o usuário é um administrador
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Apenas administradores podem realizar o sorteio." }, { status: 403 });
    }

    // Obtém o ID do torneio a partir dos parâmetros
    const { id } = await params;

    // Busca os dados do torneio no banco de dados, incluindo os participantes
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Torneio não encontrado." },
        { status: 404 }
      );
    }

    // Obtém os participantes do torneio
    const participants = tournament.participants;

    if (participants.length < 2) {
      return NextResponse.json(
        {
          error: "São necessários pelo menos 2 participantes para realizar o sorteio.",
        },
        { status: 400 }
      );
    }

    // Embaralha os participantes aleatoriamente para garantir um sorteio justo
    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    // Apaga os dados anteriores de partidas, sets e grupos para uma nova geração limpa
    await prisma.matchSet.deleteMany({
      where: { match: { tournamentId: id } },
    });
    await prisma.match.deleteMany({
      where: { tournamentId: id },
    });
    await prisma.tournamentGroup.deleteMany({
      where: { tournamentId: id },
    });

    // Define a quantidade de sets com base nas regras do torneio
    const setsCount = tournament.setsToWin === 1 ? 1 : 3;

    if (tournament.format === "GROUPS_AND_KNOCKOUT" && participants.length >= 4) {
      // Define o tamanho de cada grupo de acordo com o total de participantes
      const groupSize = participants.length >= 8 ? 4 : 3;
      
      // Gera os grupos e as partidas da fase de grupos
      const { groups, matches } = generateGroupsAndRoundRobin(
        shuffled,
        groupSize,
        tournament.setsToWin,
        tournament.pointsPerSet
      );

      // Cria os grupos no banco de dados
      for (const grp of groups) {
        await prisma.tournamentGroup.create({
          data: {
            tournamentId: id,
            name: grp.name,
          },
        });

        // Atualiza o nome do grupo para cada participante
        for (const p of grp.participants) {
          await prisma.participant.update({
            where: { id: p.id },
            data: { groupName: grp.name },
          });
        }
      }

      // Cria as partidas da fase de grupos
      for (const m of matches) {
        // Cria o registro da partida no banco de dados
        const createdMatch = await prisma.match.create({
          data: {
            tournamentId: id,
            stage: m.stage,
            round: m.round,
            matchNumber: m.matchNumber,
            groupName: m.groupName,
            participant1Id: m.participant1Id,
            participant2Id: m.participant2Id,
            status: "SCHEDULED",
            court: m.court,
          },
        });

        for (let s = 1; s <= setsCount; s++) {
          await prisma.matchSet.create({
            data: {
              matchId: createdMatch.id,
              setNumber: s,
              score1: 0,
              score2: 0,
            },
          });
        }
      }
    } else {
      // Formato SINGLE_ELIMINATION (Mata-Mata)
      // Gera as chaves do formato mata-mata
      const engineMatches = generateSingleEliminationBracket(
        shuffled,
        tournament.setsToWin,
        tournament.pointsPerSet
      );

      // Mapeia os IDs gerados pelo motor para os IDs reais do banco de dados
      const idMap = new Map<string, string>();

      for (const em of engineMatches) {
        // Cria a partida no banco de dados
        const createdMatch = await prisma.match.create({
          data: {
            tournamentId: id,
            stage: em.stage,
            round: em.round,
            matchNumber: em.matchNumber,
            participant1Id: em.participant1Id,
            participant2Id: em.participant2Id,
            winnerId: em.winnerId,
            status: em.status,
            court: em.court,
          },
        });

        idMap.set(em.id, createdMatch.id);

        for (let s = 1; s <= setsCount; s++) {
          await prisma.matchSet.create({
            data: {
              matchId: createdMatch.id,
              setNumber: s,
              score1: 0,
              score2: 0,
              isFinished: em.status === "FINISHED",
            },
          });
        }
      }

      // Segunda etapa: vincula as próximas partidas e trata os avanços automáticos (BYE)
      for (const em of engineMatches) {
        // ID real da partida atual
        const realMatchId = idMap.get(em.id);
        // ID real da próxima partida
        const realNextMatchId = em.nextMatchId ? idMap.get(em.nextMatchId) : null;

        if (realMatchId && realNextMatchId) {
          await prisma.match.update({
            where: { id: realMatchId },
            data: {
              nextMatchId: realNextMatchId,
              nextMatchSlot: em.nextMatchSlot,
            },
          });

          // Se for uma vitória por bye (automática), garante que a próxima partida tenha o participante
          if (em.winnerId && em.nextMatchSlot) {
            await prisma.match.update({
              where: { id: realNextMatchId },
              data: {
                ...(em.nextMatchSlot === 1
                  ? { participant1Id: em.winnerId }
                  : { participant2Id: em.winnerId }),
              },
            });
          }
        }
      }
    }

    // Atualiza o status do torneio para em andamento
    await prisma.tournament.update({
      where: { id },
      data: { status: "IN_PROGRESS" },
    });

    return NextResponse.json({
      success: true,
      message: "Sorteio e chaveamento gerados com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao sortear chaves:", error);
    return NextResponse.json(
      { error: "Erro ao gerar chaveamento: " + error.message },
      { status: 500 }
    );
  }
}
