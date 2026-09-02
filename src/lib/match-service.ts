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
 * Updates match scores in SQLite via Prisma, clamps points to max allowed for the tournament,
 * evaluates set and match winners, and automatically advances the winner to the next round / final.
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

  // Update or insert each set with score clamped to maxScore
  for (const s of setsInput) {
    const clampedScore1 = Math.min(maxScore, Math.max(0, Number(s.score1) || 0));
    const clampedScore2 = Math.min(maxScore, Math.max(0, Number(s.score2) || 0));
    const setEval = evaluateSetWinner(clampedScore1, clampedScore2, pointsPerSet, advantageRule);

    const existingSet = match.sets.find((es) => es.setNumber === Number(s.setNumber));
    if (existingSet) {
      await prisma.matchSet.update({
        where: { id: existingSet.id },
        data: {
          score1: clampedScore1,
          score2: clampedScore2,
          isFinished: s.isFinished !== undefined ? Boolean(s.isFinished) : setEval.isFinished,
        },
      });
    } else {
      await prisma.matchSet.create({
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

  // Fetch fresh sets from DB
  const updatedSets = await prisma.matchSet.findMany({
    where: { matchId },
    orderBy: { setNumber: "asc" },
  });

  const evaluation = evaluateMatchWinner(
    updatedSets,
    setsToWin,
    pointsPerSet,
    advantageRule
  );

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

  // Update match in database
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      winnerId: newWinnerId,
      status: newStatus,
    },
    include: {
      participant1: true,
      participant2: true,
      winner: true,
      sets: {
        orderBy: { setNumber: "asc" },
      },
    },
  });

  // Advance or clear winner in next match (e.g. final)
  if (match.nextMatchId && match.nextMatchSlot) {
    if (newWinnerId) {
      // Set the new winner in the appropriate slot of the next match
      const slotData =
        match.nextMatchSlot === 1
          ? { participant1Id: newWinnerId }
          : { participant2Id: newWinnerId };

      await prisma.match.update({
        where: { id: match.nextMatchId },
        data: slotData,
      });
    } else if (previousWinnerId) {
      // If the match no longer has a winner, clear the slot if it had previousWinnerId
      const nextMatch = await prisma.match.findUnique({
        where: { id: match.nextMatchId },
      });
      if (nextMatch) {
        if (match.nextMatchSlot === 1 && nextMatch.participant1Id === previousWinnerId) {
          await prisma.match.update({
            where: { id: match.nextMatchId },
            data: { participant1Id: null },
          });
        } else if (match.nextMatchSlot === 2 && nextMatch.participant2Id === previousWinnerId) {
          await prisma.match.update({
            where: { id: match.nextMatchId },
            data: { participant2Id: null },
          });
        }
      }
    }
  }

  // Update tournament status if this is the final match
  if (match.stage === "FINAL" || !match.nextMatchId) {
    if (newWinnerId) {
      await prisma.tournament.update({
        where: { id: match.tournamentId },
        data: { status: "FINISHED" },
      });
    } else {
      await prisma.tournament.update({
        where: { id: match.tournamentId },
        data: { status: "IN_PROGRESS" },
      });
    }
  }

  return {
    match: updatedMatch,
    evaluation,
    maxScore,
  };
}
