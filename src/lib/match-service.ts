import prisma from "@/lib/db";
import {
  evaluateMatchWinner,
  evaluateSetWinner,
  getMaxPointsForTournament,
} from "@/lib/tournament-engine";

export interface SetScoreInput {
  setNumber: number;
  score1: number;
  score2: number;
  isFinished?: boolean;
}

/**
 * Atualiza o placar das partidas no SQLite via Prisma, limita os pontos ao máximo permitido para o torneio,
 * avalia os vencedores dos sets e da partida e avança automaticamente o vencedor para a próxima rodada/final.
 */
export async function updateMatchScoreAndAdvance(
  matchId: string,
  setsInput: SetScoreInput[]
) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: true,
      sets: true,
    },
  });

  if (!match) {
    throw new Error("Partida não encontrada.");
  }

  const pointsPerSet = match.tournament.pointsPerSet;
  const setsToWin = match.tournament.setsToWin;
  const advantageRule = match.tournament.advantageRule;
  const maxScore = getMaxPointsForTournament(pointsPerSet);

  // Calcula scores e avaliações antes da transação
  const setOps = setsInput.map((s) => {
    const clampedScore1 = Math.min(maxScore, Math.max(0, Number(s.score1) || 0));
    const clampedScore2 = Math.min(maxScore, Math.max(0, Number(s.score2) || 0));
    const setEval = evaluateSetWinner(clampedScore1, clampedScore2, pointsPerSet, advantageRule);
    const existingSet = match.sets.find((es) => es.setNumber === Number(s.setNumber));
    return { s, clampedScore1, clampedScore2, setEval, existingSet };
  });

  // Executa todas as writes atomicamente
  await prisma.$transaction(async (tx) => {
    // Atualiza ou insere cada set com a pontuação limitada ao valor máximo (maxScore)
    for (const { s, clampedScore1, clampedScore2, setEval, existingSet } of setOps) {
      if (existingSet) {
        await tx.matchSet.update({
          where: { id: existingSet.id },
          data: {
            score1: clampedScore1,
            score2: clampedScore2,
            isFinished: s.isFinished !== undefined ? Boolean(s.isFinished) : setEval.isFinished,
          },
        });
      } else {
        await tx.matchSet.create({
          data: {
            matchId,
            setNumber: Number(s.setNumber),
            score1: clampedScore1,
            score2: clampedScore2,
            isFinished: s.isFinished !== undefined ? Boolean(s.isFinished) : setEval.isFinished,
          },
        });
      }
    }

    // Busca os sets atualizados para avaliar o vencedor
    const updatedSets = await tx.matchSet.findMany({
      where: { matchId },
      orderBy: { setNumber: "asc" },
    });

    const evaluation = evaluateMatchWinner(updatedSets, setsToWin, pointsPerSet, advantageRule);

    let newWinnerId: string | null = null;
    let newStatus = match.status;

    if (evaluation.isFinished && evaluation.winnerSlot) {
      newWinnerId = evaluation.winnerSlot === 1 ? match.participant1Id : match.participant2Id;
      newStatus = "FINISHED";
    } else {
      newWinnerId = null;
      const hasAnyPoints = updatedSets.some((s) => s.score1 > 0 || s.score2 > 0);
      newStatus = hasAnyPoints ? "IN_PROGRESS" : "SCHEDULED";
    }

    const previousWinnerId = match.winnerId;

    // Atualiza a partida no banco de dados
    await tx.match.update({
      where: { id: matchId },
      data: { winnerId: newWinnerId, status: newStatus },
    });

    // Avança ou limpa o vencedor na próxima partida (ex: final)
    if (match.nextMatchId && match.nextMatchSlot) {
      if (newWinnerId) {
        const slotData =
          match.nextMatchSlot === 1
            ? { participant1Id: newWinnerId }
            : { participant2Id: newWinnerId };
        await tx.match.update({ where: { id: match.nextMatchId }, data: slotData });
      } else if (previousWinnerId) {
        const nextMatch = await tx.match.findUnique({ where: { id: match.nextMatchId } });
        if (nextMatch) {
          if (match.nextMatchSlot === 1 && nextMatch.participant1Id === previousWinnerId) {
            await tx.match.update({ where: { id: match.nextMatchId }, data: { participant1Id: null } });
          } else if (match.nextMatchSlot === 2 && nextMatch.participant2Id === previousWinnerId) {
            await tx.match.update({ where: { id: match.nextMatchId }, data: { participant2Id: null } });
          }
        }
      }
    }

    // Atualiza o status do torneio se esta for a partida final
    if (match.stage === "FINAL" || !match.nextMatchId) {
      await tx.tournament.update({
        where: { id: match.tournamentId },
        data: { status: newWinnerId ? "FINISHED" : "IN_PROGRESS" },
      });
    }
  });

  // Busca o estado final para retornar
  const [updatedMatch, updatedSets] = await Promise.all([
    prisma.match.findUniqueOrThrow({
      where: { id: matchId },
      include: {
        participant1: true,
        participant2: true,
        winner: true,
        sets: { orderBy: { setNumber: "asc" } },
      },
    }),
    prisma.matchSet.findMany({ where: { matchId }, orderBy: { setNumber: "asc" } }),
  ]);

  const evaluation = evaluateMatchWinner(updatedSets, setsToWin, pointsPerSet, advantageRule);

  return {
    match: updatedMatch,
    evaluation,
    maxScore,
  };
}
