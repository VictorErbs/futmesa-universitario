import { GroupStanding, MatchSetType, MatchType, ParticipantType } from "@/types/tournament";

export interface EngineParticipant {
  id: string;
  name: string;
  partnerName?: string | null;
  seed?: number | null;
  groupName?: string | null;
}

export interface EngineMatchSet {
  score1: number;
  score2: number;
  isFinished?: boolean;
  setNumber?: number;
}

export interface EngineMatch {
  id: string;
  tournamentId?: string;
  stage: string;
  round: number;
  matchNumber: number;
  groupName?: string | null;
  participant1Id: string | null;
  participant2Id: string | null;
  winnerId: string | null;
  status: "SCHEDULED" | "IN_PROGRESS" | "FINISHED" | "BYE" | "AGENDADA" | "AO_VIVO" | "FINALIZADA";
  nextMatchId?: string | null;
  nextMatchSlot?: number | null;
  court?: string | null;
  sets?: EngineMatchSet[];
}

export interface StandingsResult {
  participantId: string;
  participantName: string;
  groupName?: string | null;
  partnerName?: string | null;
  played: number;
  won: number;
  lost: number;
  points: number;
  setsWon: number;
  setsLost: number;
  setsDifference: number;
  pointsWon: number;
  pointsLost: number;
  pointsDifference: number;
  setDiff: number;
  pointDiff: number;
  isQualified?: boolean;
  name?: string;
}

/**
 * Checks if a set is completed according to Futmesa rules
 */
export function evaluateSetWinner(
  score1: number,
  score2: number,
  pointsPerSet: number = 18,
  advantageRule: boolean = true
): { isFinished: boolean; winner: 1 | 2 | null } {
  if (advantageRule) {
    if (score1 >= pointsPerSet && score1 - score2 >= 2) {
      return { isFinished: true, winner: 1 };
    }
    if (score2 >= pointsPerSet && score2 - score1 >= 2) {
      return { isFinished: true, winner: 2 };
    }
    return { isFinished: false, winner: null };
  } else {
    if (score1 >= pointsPerSet && score1 > score2) {
      return { isFinished: true, winner: 1 };
    }
    if (score2 >= pointsPerSet && score2 > score1) {
      return { isFinished: true, winner: 2 };
    }
    return { isFinished: false, winner: null };
  }
}

/**
 * Backward-compatible alias
 */
export function isSetFinished(score1: number, score2: number, pointsPerSet: number = 18) {
  const res = evaluateSetWinner(score1, score2, pointsPerSet, true);
  return { finished: res.isFinished, winner: res.winner };
}

/**
 * Evaluates whether the match is won
 */
export function evaluateMatchWinner(
  sets: EngineMatchSet[],
  setsToWin: number = 2,
  pointsPerSet: number = 18,
  advantageRule: boolean = true
): {
  isFinished: boolean;
  winnerSlot: 1 | 2 | null;
  setsWon1: number;
  setsWon2: number;
  setsWonP1?: number;
  setsWonP2?: number;
} {
  let setsWon1 = 0;
  let setsWon2 = 0;

  for (const s of sets) {
    if (s.isFinished) {
      if (s.score1 > s.score2) setsWon1++;
      else if (s.score2 > s.score1) setsWon2++;
    } else {
      const evalSet = evaluateSetWinner(s.score1, s.score2, pointsPerSet, advantageRule);
      if (evalSet.isFinished) {
        if (evalSet.winner === 1) setsWon1++;
        if (evalSet.winner === 2) setsWon2++;
      }
    }
  }

  const isFinished = setsWon1 >= setsToWin || setsWon2 >= setsToWin;
  let winnerSlot: 1 | 2 | null = null;
  if (setsWon1 >= setsToWin) winnerSlot = 1;
  else if (setsWon2 >= setsToWin) winnerSlot = 2;

  return {
    isFinished,
    winnerSlot,
    setsWon1,
    setsWon2,
    setsWonP1: setsWon1,
    setsWonP2: setsWon2,
  };
}

/**
 * Check score state (Deuce, Advantage, Set Point)
 */
export function getScoreState(
  score1: number,
  score2: number,
  pointsPerSet: number = 18
): {
  isDeuce: boolean;
  advantage: 1 | 2 | null;
  statusText: string;
} {
  const deuceThreshold = pointsPerSet - 1;
  const isDeuce = score1 >= deuceThreshold && score2 >= deuceThreshold && score1 === score2;
  let advantage: 1 | 2 | null = null;
  let statusText = "Em jogo";

  if (score1 >= deuceThreshold && score2 >= deuceThreshold) {
    if (score1 === score2) {
      statusText = `DEUCE (${score1} - ${score2})`;
    } else if (score1 === score2 + 1) {
      advantage = 1;
      statusText = "Vantagem Lado 1 (Set Point)";
    } else if (score2 === score1 + 1) {
      advantage = 2;
      statusText = "Vantagem Lado 2 (Set Point)";
    }
  } else {
    if (score1 === pointsPerSet - 1 && score2 < score1) {
      statusText = "Set Point Lado 1";
    } else if (score2 === pointsPerSet - 1 && score1 < score2) {
      statusText = "Set Point Lado 2";
    }
  }

  return { isDeuce, advantage, statusText };
}

/**
 * Computes standard tournament seeding order (e.g., [1,4,2,3] for 4, [1,8,4,5,2,7,3,6] for 8)
 */
export function getBracketSeedOrder(size: number): number[] {
  if (size === 2) return [1, 2];

  let order = [1, 2];
  while (order.length < size) {
    const nextOrder: number[] = [];
    const currentSum = order.length * 2 + 1;
    for (const seed of order) {
      nextOrder.push(seed);
      nextOrder.push(currentSum - seed);
    }
    order = nextOrder;
  }
  return order;
}

export function getStageName(round: number, totalRounds: number): string {
  const diff = totalRounds - round;
  if (diff === 0) return "FINAL";
  if (diff === 1) return "SEMI_FINALS";
  if (diff === 2) return "QUARTER_FINALS";
  if (diff === 3) return "ROUND_OF_16";
  return `ROUND_${round}`;
}

export function getRoundDisplayName(stageOrRound: string | number, totalRounds?: number): string {
  if (typeof stageOrRound === "string") {
    switch (stageOrRound) {
      case "FINAL":
        return "Grande Final";
      case "SEMI_FINALS":
        return "Semifinal";
      case "QUARTER_FINALS":
        return "Quartas de Final";
      case "ROUND_OF_16":
        return "Oitavas de Final";
      case "GROUPS":
        return "Fase de Grupos";
      default:
        return stageOrRound;
    }
  }
  if (totalRounds) {
    const diff = totalRounds - stageOrRound;
    if (diff === 0) return "Grande Final";
    if (diff === 1) return "Semifinal";
    if (diff === 2) return "Quartas de Final";
    if (diff === 3) return "Oitavas de Final";
  }
  return `Rodada ${stageOrRound}`;
}

/**
 * Generates single elimination bracket matching tests
 */
export function generateSingleEliminationBracket(
  participants: EngineParticipant[],
  setsToWin: number = 2,
  pointsPerSet: number = 18
): EngineMatch[] {
  const count = participants.length;
  if (count < 2) {
    throw new Error("Pelo menos 2 participantes são necessários para o chaveamento.");
  }

  let bracketSize = 2;
  while (bracketSize < count) {
    bracketSize *= 2;
  }

  const totalRounds = Math.log2(bracketSize);
  const seedOrder = getBracketSeedOrder(bracketSize);

  // Map participants by seed or index
  const sortedParticipants = [...participants].sort(
    (a, b) => (a.seed ?? 999) - (b.seed ?? 999)
  );

  const participantBySeed = new Map<number, EngineParticipant>();
  sortedParticipants.forEach((p, idx) => {
    participantBySeed.set(p.seed ?? idx + 1, p);
  });

  const allMatches: EngineMatch[] = [];
  const matchesByRound: EngineMatch[][] = [];
  let matchIdCounter = 1;

  for (let r = 1; r <= totalRounds; r++) {
    const stage = getStageName(r, totalRounds);
    const matchesInRoundCount = bracketSize / Math.pow(2, r);
    const currentRoundMatches: EngineMatch[] = [];

    for (let m = 1; m <= matchesInRoundCount; m++) {
      const match: EngineMatch = {
        id: `match-r${r}-m${m}-${Date.now().toString(36)}-${matchIdCounter++}`,
        stage,
        round: r,
        matchNumber: m,
        participant1Id: null,
        participant2Id: null,
        winnerId: null,
        status: "SCHEDULED",
        nextMatchId: null,
        nextMatchSlot: null,
        court: `Mesa ${((m - 1) % 3) + 1}`,
        sets: [],
      };
      currentRoundMatches.push(match);
      allMatches.push(match);
    }
    matchesByRound.push(currentRoundMatches);
  }

  // Link progression (nextMatchId and nextMatchSlot)
  for (let r = 0; r < totalRounds - 1; r++) {
    const currentRound = matchesByRound[r];
    const nextRound = matchesByRound[r + 1];

    for (let i = 0; i < currentRound.length; i++) {
      const nextMatch = nextRound[Math.floor(i / 2)];
      const slot = (i % 2) + 1;

      currentRound[i].nextMatchId = nextMatch.id;
      currentRound[i].nextMatchSlot = slot;
    }
  }

  // Populate Round 1 with seeds
  const round1 = matchesByRound[0];
  for (let i = 0; i < round1.length; i++) {
    const match = round1[i];
    const seed1 = seedOrder[i * 2];
    const seed2 = seedOrder[i * 2 + 1];

    const p1 = participantBySeed.get(seed1) || null;
    const p2 = participantBySeed.get(seed2) || null;

    match.participant1Id = p1 ? p1.id : null;
    match.participant2Id = p2 ? p2.id : null;

    // Handle automatic BYE
    if (p1 && !p2) {
      match.winnerId = p1.id;
      match.status = "FINISHED";

      // Advance to next round immediately
      if (match.nextMatchId && match.nextMatchSlot) {
        const next = allMatches.find((m) => m.id === match.nextMatchId);
        if (next) {
          if (match.nextMatchSlot === 1) next.participant1Id = p1.id;
          else next.participant2Id = p1.id;
        }
      }
    } else if (!p1 && p2) {
      match.winnerId = p2.id;
      match.status = "FINISHED";

      if (match.nextMatchId && match.nextMatchSlot) {
        const next = allMatches.find((m) => m.id === match.nextMatchId);
        if (next) {
          if (match.nextMatchSlot === 1) next.participant1Id = p2.id;
          else next.participant2Id = p2.id;
        }
      }
    }
  }

  return allMatches;
}

/**
 * Backward compatibility alias for UI components
 */
export function generateKnockoutTree(participants: any[]) {
  const matches = generateSingleEliminationBracket(participants, 2, 18);
  const totalRounds = Math.max(...matches.map((m) => m.round));
  return {
    roundsCount: totalRounds,
    bracketMatches: matches.map((m) => ({
      ...m,
      roundName: getRoundDisplayName(m.stage, totalRounds),
    })),
  };
}

/**
 * Advance winner in knockout bracket tree
 */
export function advanceWinnerInBracket(
  matches: EngineMatch[],
  matchId: string,
  winnerId: string
): EngineMatch[] {
  const match = matches.find((m) => m.id === matchId);
  if (!match) return matches;

  match.winnerId = winnerId;
  match.status = "FINISHED";

  if (match.nextMatchId && match.nextMatchSlot) {
    const nextMatch = matches.find((m) => m.id === match.nextMatchId);
    if (nextMatch) {
      if (match.nextMatchSlot === 1) {
        nextMatch.participant1Id = winnerId;
      } else {
        nextMatch.participant2Id = winnerId;
      }
    }
  }

  return matches;
}

/**
 * Generate Groups and Round Robin matches
 */
export function generateGroupsAndRoundRobin(
  participants: EngineParticipant[],
  groupSize: number = 4,
  setsToWin: number = 2,
  pointsPerSet: number = 18
): {
  groups: { name: string; participants: EngineParticipant[] }[];
  matches: EngineMatch[];
} {
  const numGroups = Math.ceil(participants.length / groupSize);
  const groupLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const groups: { name: string; participants: EngineParticipant[] }[] = [];

  for (let g = 0; g < numGroups; g++) {
    groups.push({
      name: `Grupo ${groupLetters[g] || g + 1}`,
      participants: [],
    });
  }

  // Distribute participants in snake or round-robin style
  participants.forEach((p, idx) => {
    const grpIdx = idx % numGroups;
    const groupName = groups[grpIdx].name;
    groups[grpIdx].participants.push({ ...p, groupName });
  });

  const matches: EngineMatch[] = [];
  let matchNumber = 1;

  for (const group of groups) {
    const pList = group.participants;
    for (let i = 0; i < pList.length; i++) {
      for (let j = i + 1; j < pList.length; j++) {
        matches.push({
          id: `match-grp-${group.name.replace(/\s+/g, "_")}-${i}-${j}-${Date.now().toString(36)}-${matchNumber}`,
          stage: "GROUPS",
          round: 1,
          matchNumber: matchNumber++,
          groupName: group.name,
          participant1Id: pList[i].id,
          participant2Id: pList[j].id,
          winnerId: null,
          status: "SCHEDULED",
          court: `Mesa ${((matchNumber - 1) % 3) + 1}`,
          sets: [],
        });
      }
    }
  }

  return { groups, matches };
}

/**
 * Calculates group standings table with tiebreakers
 */
export function calculateGroupStandings(
  groupParticipants: (EngineParticipant | ParticipantType)[],
  groupMatches: (EngineMatch | MatchType | any)[],
  pointsPerSet: number = 18
): StandingsResult[] {
  const standingsMap = new Map<string, StandingsResult>();

  for (const p of groupParticipants) {
    standingsMap.set(p.id, {
      participantId: p.id,
      participantName: p.name,
      name: p.name,
      partnerName: p.partnerName,
      groupName: (p as any).groupName || null,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      setsWon: 0,
      setsLost: 0,
      setsDifference: 0,
      pointsWon: 0,
      pointsLost: 0,
      pointsDifference: 0,
      setDiff: 0,
      pointDiff: 0,
      isQualified: false,
    });
  }

  for (const match of groupMatches) {
    const isFinished = match.status === "FINISHED" || match.status === "FINALIZADA";
    if (!isFinished || !match.participant1Id || !match.participant2Id) {
      continue;
    }

    const p1 = standingsMap.get(match.participant1Id);
    const p2 = standingsMap.get(match.participant2Id);
    if (!p1 || !p2) continue;

    p1.played += 1;
    p2.played += 1;

    let p1Sets = 0;
    let p2Sets = 0;
    let p1Pts = 0;
    let p2Pts = 0;

    for (const set of match.sets || []) {
      p1Pts += set.score1 || 0;
      p2Pts += set.score2 || 0;

      if (set.isFinished) {
        if (set.score1 > set.score2) p1Sets++;
        else if (set.score2 > set.score1) p2Sets++;
      } else {
        const evalSet = evaluateSetWinner(set.score1 || 0, set.score2 || 0, 18, true);
        if (evalSet.isFinished) {
          if (evalSet.winner === 1) p1Sets++;
          else if (evalSet.winner === 2) p2Sets++;
        }
      }
    }

    p1.setsWon += p1Sets;
    p1.setsLost += p2Sets;
    p2.setsWon += p2Sets;
    p2.setsLost += p1Sets;

    p1.pointsWon += p1Pts;
    p1.pointsLost += p2Pts;
    p2.pointsWon += p2Pts;
    p2.pointsLost += p1Pts;

    if (match.winnerId === p1.participantId || p1Sets > p2Sets) {
      p1.won += 1;
      p1.points += 3;
      p2.lost += 1;
    } else if (match.winnerId === p2.participantId || p2Sets > p1Sets) {
      p2.won += 1;
      p2.points += 3;
      p1.lost += 1;
    }
  }

  const result = Array.from(standingsMap.values()).map((row) => {
    const setsDiff = row.setsWon - row.setsLost;
    const ptsDiff = row.pointsWon - row.pointsLost;
    return {
      ...row,
      setsDifference: setsDiff,
      pointsDifference: ptsDiff,
      setDiff: setsDiff,
      pointDiff: ptsDiff,
    };
  });

  // Sort by: 1) Points, 2) setsDifference, 3) pointsDifference, 4) pointsWon
  result.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.setsDifference !== a.setsDifference) return b.setsDifference - a.setsDifference;
    if (b.pointsDifference !== a.pointsDifference) return b.pointsDifference - a.pointsDifference;
    return b.pointsWon - a.pointsWon;
  });

  // Mark G2 (top 2)
  result.forEach((row, idx) => {
    if (idx < 2 && row.played > 0) {
      row.isQualified = true;
    }
  });

  return result;
}

/**
 * Qualifies top teams from groups to Knockout Playoff matches
 */
export function qualifyTopTeamsToKnockout(
  standingsByGroup: Record<string, StandingsResult[]>,
  setsToWin: number = 2,
  pointsPerSet: number = 18
): EngineMatch[] {
  const groupNames = Object.keys(standingsByGroup);

  if (groupNames.length === 2) {
    const gA = standingsByGroup[groupNames[0]];
    const gB = standingsByGroup[groupNames[1]];

    const finalMatch: EngineMatch = {
      id: `playoff-final-${Date.now().toString(36)}`,
      stage: "FINAL",
      round: 2,
      matchNumber: 3,
      participant1Id: null,
      participant2Id: null,
      winnerId: null,
      status: "SCHEDULED",
      nextMatchId: null,
      nextMatchSlot: null,
      court: "Mesa Central",
      sets: [],
    };

    const semi1: EngineMatch = {
      id: `playoff-semi-1-${Date.now().toString(36)}`,
      stage: "SEMI_FINALS",
      round: 1,
      matchNumber: 1,
      participant1Id: gA[0]?.participantId || null,
      participant2Id: gB[1]?.participantId || null,
      winnerId: null,
      status: "SCHEDULED",
      nextMatchId: finalMatch.id,
      nextMatchSlot: 1,
      court: "Mesa 1",
      sets: [],
    };

    const semi2: EngineMatch = {
      id: `playoff-semi-2-${Date.now().toString(36)}`,
      stage: "SEMI_FINALS",
      round: 1,
      matchNumber: 2,
      participant1Id: gB[0]?.participantId || null,
      participant2Id: gA[1]?.participantId || null,
      winnerId: null,
      status: "SCHEDULED",
      nextMatchId: finalMatch.id,
      nextMatchSlot: 2,
      court: "Mesa 2",
      sets: [],
    };

    return [semi1, semi2, finalMatch];
  }

  return [];
}
