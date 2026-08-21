import { describe, it, expect } from 'vitest'
import {
  evaluateSetWinner,
  evaluateMatchWinner,
  generateSingleEliminationBracket,
  generateGroupsAndRoundRobin,
  calculateGroupStandings,
  qualifyTopTeamsToKnockout,
  advanceWinnerInBracket,
  getBracketSeedOrder
} from '../tournament-engine'

describe('Tournament Engine', () => {
  describe('evaluateSetWinner', () => {
    it('finishes set when reaching target points with 2-point difference (advantageRule = true)', () => {
      // 18x16 finishes with winner 1
      const res1 = evaluateSetWinner(18, 16, 18, true)
      expect(res1.isFinished).toBe(true)
      expect(res1.winner).toBe(1)

      // 16x18 finishes with winner 2
      const res2 = evaluateSetWinner(16, 18, 18, true)
      expect(res2.isFinished).toBe(true)
      expect(res2.winner).toBe(2)

      // 18x10 finishes with winner 1
      const res3 = evaluateSetWinner(18, 10, 18, true)
      expect(res3.isFinished).toBe(true)
      expect(res3.winner).toBe(1)
    })

    it('does not finish set if difference is less than 2 at or above target points', () => {
      // 18x17 must continue
      const res1 = evaluateSetWinner(18, 17, 18, true)
      expect(res1.isFinished).toBe(false)
      expect(res1.winner).toBe(null)

      // 19x18 must continue
      const res2 = evaluateSetWinner(19, 18, 18, true)
      expect(res2.isFinished).toBe(false)
      expect(res2.winner).toBe(null)
    })

    it('finishes set in deuce when advantage of 2 is achieved', () => {
      // 20x18 finishes with winner 1
      const res1 = evaluateSetWinner(20, 18, 18, true)
      expect(res1.isFinished).toBe(true)
      expect(res1.winner).toBe(1)

      // 21x23 finishes with winner 2
      const res2 = evaluateSetWinner(21, 23, 18, true)
      expect(res2.isFinished).toBe(true)
      expect(res2.winner).toBe(2)
    })

    it('handles advantageRule = false correctly', () => {
      // 18x17 finishes immediately without advantage rule
      const res1 = evaluateSetWinner(18, 17, 18, false)
      expect(res1.isFinished).toBe(true)
      expect(res1.winner).toBe(1)

      // 17x18 finishes with winner 2
      const res2 = evaluateSetWinner(17, 18, 18, false)
      expect(res2.isFinished).toBe(true)
      expect(res2.winner).toBe(2)

      // 17x17 not finished
      const res3 = evaluateSetWinner(17, 17, 18, false)
      expect(res3.isFinished).toBe(false)
      expect(res3.winner).toBe(null)
    })
  })

  describe('evaluateMatchWinner', () => {
    it('determines winner in best of 3 (setsToWin = 2)', () => {
      const sets = [
        { score1: 18, score2: 12, isFinished: true, setNumber: 1 },
        { score1: 18, score2: 15, isFinished: true, setNumber: 2 }
      ]
      const result = evaluateMatchWinner(sets, 2, 18, true)
      expect(result.isFinished).toBe(true)
      expect(result.winnerSlot).toBe(1)
      expect(result.setsWon1).toBe(2)
      expect(result.setsWon2).toBe(0)
    })

    it('determines winner in 3-set match', () => {
      const sets = [
        { score1: 18, score2: 14, isFinished: true, setNumber: 1 },
        { score1: 12, score2: 18, isFinished: true, setNumber: 2 },
        { score1: 16, score2: 18, isFinished: true, setNumber: 3 }
      ]
      const result = evaluateMatchWinner(sets, 2, 18, true)
      expect(result.isFinished).toBe(true)
      expect(result.winnerSlot).toBe(2)
      expect(result.setsWon1).toBe(1)
      expect(result.setsWon2).toBe(2)
    })

    it('reports match as unfinished when neither player has reached setsToWin', () => {
      const sets = [
        { score1: 18, score2: 14, isFinished: true, setNumber: 1 },
        { score1: 5, score2: 8, isFinished: false, setNumber: 2 }
      ]
      const result = evaluateMatchWinner(sets, 2, 18, true)
      expect(result.isFinished).toBe(false)
      expect(result.winnerSlot).toBe(null)
      expect(result.setsWon1).toBe(1)
      expect(result.setsWon2).toBe(0)
    })

    it('handles best of 1 (setsToWin = 1)', () => {
      const sets = [{ score1: 18, score2: 10, isFinished: true, setNumber: 1 }]
      const result = evaluateMatchWinner(sets, 1, 18, true)
      expect(result.isFinished).toBe(true)
      expect(result.winnerSlot).toBe(1)
    })
  })

  describe('getBracketSeedOrder', () => {
    it('returns correct seed positions for power of 2', () => {
      expect(getBracketSeedOrder(2)).toEqual([1, 2])
      expect(getBracketSeedOrder(4)).toEqual([1, 4, 2, 3])
      expect(getBracketSeedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6])
    })
  })

  describe('generateSingleEliminationBracket', () => {
    it('generates 4-participant bracket (2 Semis, 1 Final)', () => {
      const participants = [
        { id: 'p1', name: 'Dupla 1', seed: 1 },
        { id: 'p2', name: 'Dupla 2', seed: 2 },
        { id: 'p3', name: 'Dupla 3', seed: 3 },
        { id: 'p4', name: 'Dupla 4', seed: 4 }
      ]

      const matches = generateSingleEliminationBracket(participants, 2, 18)
      expect(matches).toHaveLength(3)

      const round1 = matches.filter((m) => m.round === 1)
      const finalRound = matches.filter((m) => m.round === 2)

      expect(round1).toHaveLength(2)
      expect(finalRound).toHaveLength(1)

      expect(round1[0].stage).toBe('SEMI_FINALS')
      expect(finalRound[0].stage).toBe('FINAL')

      // Semis connect to Final
      expect(round1[0].nextMatchId).toBe(finalRound[0].id)
      expect(round1[0].nextMatchSlot).toBe(1)
      expect(round1[1].nextMatchId).toBe(finalRound[0].id)
      expect(round1[1].nextMatchSlot).toBe(2)
    })

    it('generates 8-participant bracket (4 QF, 2 Semis, 1 Final)', () => {
      const participants = Array.from({ length: 8 }, (_, i) => ({
        id: `p${i + 1}`,
        name: `Dupla ${i + 1}`,
        seed: i + 1
      }))

      const matches = generateSingleEliminationBracket(participants, 2, 18)
      expect(matches).toHaveLength(7)

      const qf = matches.filter((m) => m.stage === 'QUARTER_FINALS')
      const sf = matches.filter((m) => m.stage === 'SEMI_FINALS')
      const fn = matches.filter((m) => m.stage === 'FINAL')

      expect(qf).toHaveLength(4)
      expect(sf).toHaveLength(2)
      expect(fn).toHaveLength(1)

      // Match 1: Seed 1 vs Seed 8
      expect(qf[0].participant1Id).toBe('p1')
      expect(qf[0].participant2Id).toBe('p8')

      // Check progression links
      expect(qf[0].nextMatchId).toBe(sf[0].id)
      expect(qf[0].nextMatchSlot).toBe(1)
      expect(qf[1].nextMatchId).toBe(sf[0].id)
      expect(qf[1].nextMatchSlot).toBe(2)
    })

    it('handles odd participants with automatic BYEs', () => {
      // 5 participants in an 8-bracket (3 BYEs)
      const participants = [
        { id: 'p1', name: 'Dupla 1', seed: 1 },
        { id: 'p2', name: 'Dupla 2', seed: 2 },
        { id: 'p3', name: 'Dupla 3', seed: 3 },
        { id: 'p4', name: 'Dupla 4', seed: 4 },
        { id: 'p5', name: 'Dupla 5', seed: 5 }
      ]

      const matches = generateSingleEliminationBracket(participants, 2, 18)
      expect(matches).toHaveLength(7)

      // QF1: Seed 1 vs BYE -> P1 auto wins and moves to Semi 1 slot 1
      const qf1 = matches.find((m) => m.round === 1 && m.matchNumber === 1)!
      expect(qf1.participant1Id).toBe('p1')
      expect(qf1.participant2Id).toBeNull()
      expect(qf1.winnerId).toBe('p1')
      expect(qf1.status).toBe('FINISHED')

      const semi1 = matches.find((m) => m.id === qf1.nextMatchId)!
      expect(semi1.participant1Id).toBe('p1')
    })

    it('throws error if less than 2 participants', () => {
      expect(() => generateSingleEliminationBracket([{ id: 'p1', name: 'Solo' }])).toThrow()
    })
  })

  describe('generateGroupsAndRoundRobin', () => {
    it('divides 8 participants into 2 groups of 4 and generates round-robin matches', () => {
      const participants = Array.from({ length: 8 }, (_, i) => ({
        id: `p${i + 1}`,
        name: `Dupla ${i + 1}`,
        seed: i + 1
      }))

      const { groups, matches } = generateGroupsAndRoundRobin(participants, 4, 2, 18)

      expect(groups).toHaveLength(2)
      expect(groups[0].name).toBe('Grupo A')
      expect(groups[1].name).toBe('Grupo B')

      expect(groups[0].participants).toHaveLength(4)
      expect(groups[1].participants).toHaveLength(4)

      // In 4-team round-robin: C(4,2) = 6 matches per group -> 12 matches total
      expect(matches).toHaveLength(12)
      expect(matches.filter((m) => m.groupName === 'Grupo A')).toHaveLength(6)
      expect(matches.filter((m) => m.groupName === 'Grupo B')).toHaveLength(6)

      // Verify every pair in Grupo A plays exactly once
      const groupAPairings = new Set<string>()
      matches
        .filter((m) => m.groupName === 'Grupo A')
        .forEach((m) => {
          const pair = [m.participant1Id, m.participant2Id].sort().join('-')
          groupAPairings.add(pair)
        })
      expect(groupAPairings.size).toBe(6)
    })

    it('handles odd number of participants per group', () => {
      const participants = Array.from({ length: 6 }, (_, i) => ({
        id: `p${i + 1}`,
        name: `Dupla ${i + 1}`
      }))

      const { groups, matches } = generateGroupsAndRoundRobin(participants, 3, 2, 18)
      expect(groups).toHaveLength(2)
      // 3 teams per group: C(3,2) = 3 matches per group -> 6 total matches
      expect(matches).toHaveLength(6)
    })
  })

  describe('calculateGroupStandings', () => {
    it('calculates points, sets, and score differences accurately', () => {
      const groupParticipants = [
        { id: 'p1', name: 'Time Alpha', groupName: 'Grupo A' },
        { id: 'p2', name: 'Time Beta', groupName: 'Grupo A' },
        { id: 'p3', name: 'Time Gama', groupName: 'Grupo A' }
      ]

      // Match 1: Alpha vs Beta -> Alpha wins 2-0 (18-10, 18-12)
      // Match 2: Alpha vs Gama -> Alpha wins 2-1 (18-14, 15-18, 18-16)
      // Match 3: Beta vs Gama -> Beta wins 2-0 (18-14, 18-15)
      const groupMatches = [
        {
          participant1Id: 'p1',
          participant2Id: 'p2',
          winnerId: 'p1',
          status: 'FINISHED',
          sets: [
            { score1: 18, score2: 10, isFinished: true },
            { score1: 18, score2: 12, isFinished: true }
          ]
        },
        {
          participant1Id: 'p1',
          participant2Id: 'p3',
          winnerId: 'p1',
          status: 'FINISHED',
          sets: [
            { score1: 18, score2: 14, isFinished: true },
            { score1: 15, score2: 18, isFinished: true },
            { score1: 18, score2: 16, isFinished: true }
          ]
        },
        {
          participant1Id: 'p2',
          participant2Id: 'p3',
          winnerId: 'p2',
          status: 'FINISHED',
          sets: [
            { score1: 18, score2: 14, isFinished: true },
            { score1: 18, score2: 15, isFinished: true }
          ]
        }
      ]

      const standings = calculateGroupStandings(groupParticipants, groupMatches)

      expect(standings).toHaveLength(3)

      // 1st place: Alpha (2 wins, 6 points)
      expect(standings[0].participantId).toBe('p1')
      expect(standings[0].played).toBe(2)
      expect(standings[0].won).toBe(2)
      expect(standings[0].lost).toBe(0)
      expect(standings[0].points).toBe(6)
      expect(standings[0].setsWon).toBe(4)
      expect(standings[0].setsLost).toBe(1)
      expect(standings[0].setsDifference).toBe(3)

      // 2nd place: Beta (1 win, 3 points)
      expect(standings[1].participantId).toBe('p2')
      expect(standings[1].won).toBe(1)
      expect(standings[1].lost).toBe(1)
      expect(standings[1].points).toBe(3)

      // 3rd place: Gama (0 wins, 0 points)
      expect(standings[2].participantId).toBe('p3')
      expect(standings[2].won).toBe(0)
      expect(standings[2].lost).toBe(2)
      expect(standings[2].points).toBe(0)
    })

    it('breaks ties using sets difference and points difference', () => {
      const groupParticipants = [
        { id: 'p1', name: 'Time 1', groupName: 'Grupo A' },
        { id: 'p2', name: 'Time 2', groupName: 'Grupo A' }
      ]

      // Both have 3 points and 1 win, but p1 has better set difference
      const matches = [
        {
          participant1Id: 'p1',
          participant2Id: 'dummy',
          winnerId: 'p1',
          status: 'FINISHED',
          sets: [
            { score1: 18, score2: 5, isFinished: true },
            { score1: 18, score2: 5, isFinished: true }
          ]
        },
        {
          participant1Id: 'p2',
          participant2Id: 'dummy',
          winnerId: 'p2',
          status: 'FINISHED',
          sets: [
            { score1: 18, score2: 16, isFinished: true },
            { score1: 15, score2: 18, isFinished: true },
            { score1: 18, score2: 16, isFinished: true }
          ]
        }
      ]

      const standings = calculateGroupStandings(groupParticipants, matches)
      expect(standings[0].participantId).toBe('p1')
      expect(standings[1].participantId).toBe('p2')
    })
  })

  describe('qualifyTopTeamsToKnockout', () => {
    it('creates Semifinals and Final for 2 groups', () => {
      const groupAStandings = [
        {
          participantId: 'pA1',
          participantName: '1st A',
          groupName: 'Grupo A',
          played: 3,
          won: 3,
          lost: 0,
          points: 9,
          setsWon: 6,
          setsLost: 0,
          setsDifference: 6,
          pointsWon: 108,
          pointsLost: 60,
          pointsDifference: 48
        },
        {
          participantId: 'pA2',
          participantName: '2nd A',
          groupName: 'Grupo A',
          played: 3,
          won: 2,
          lost: 1,
          points: 6,
          setsWon: 4,
          setsLost: 2,
          setsDifference: 2,
          pointsWon: 95,
          pointsLost: 80,
          pointsDifference: 15
        }
      ]

      const groupBStandings = [
        {
          participantId: 'pB1',
          participantName: '1st B',
          groupName: 'Grupo B',
          played: 3,
          won: 3,
          lost: 0,
          points: 9,
          setsWon: 6,
          setsLost: 1,
          setsDifference: 5,
          pointsWon: 105,
          pointsLost: 70,
          pointsDifference: 35
        },
        {
          participantId: 'pB2',
          participantName: '2nd B',
          groupName: 'Grupo B',
          played: 3,
          won: 2,
          lost: 1,
          points: 6,
          setsWon: 4,
          setsLost: 3,
          setsDifference: 1,
          pointsWon: 90,
          pointsLost: 85,
          pointsDifference: 5
        }
      ]

      const knockoutMatches = qualifyTopTeamsToKnockout({
        'Grupo A': groupAStandings,
        'Grupo B': groupBStandings
      })

      expect(knockoutMatches).toHaveLength(3)

      const semi1 = knockoutMatches[0]
      const semi2 = knockoutMatches[1]
      const finalMatch = knockoutMatches[2]

      expect(semi1.stage).toBe('SEMI_FINALS')
      expect(semi2.stage).toBe('SEMI_FINALS')
      expect(finalMatch.stage).toBe('FINAL')

      // Semi 1: 1A vs 2B
      expect(semi1.participant1Id).toBe('pA1')
      expect(semi1.participant2Id).toBe('pB2')
      expect(semi1.nextMatchId).toBe(finalMatch.id)
      expect(semi1.nextMatchSlot).toBe(1)

      // Semi 2: 1B vs 2A
      expect(semi2.participant1Id).toBe('pB1')
      expect(semi2.participant2Id).toBe('pA2')
      expect(semi2.nextMatchId).toBe(finalMatch.id)
      expect(semi2.nextMatchSlot).toBe(2)
    })
  })

  describe('advanceWinnerInBracket', () => {
    it('updates match winner and advances to next match', () => {
      const initialMatches = [
        {
          id: 'semi-1',
          stage: 'SEMI_FINALS',
          round: 1,
          matchNumber: 1,
          participant1Id: 'team-1',
          participant2Id: 'team-2',
          winnerId: null,
          status: 'SCHEDULED' as const,
          nextMatchId: 'final-1',
          nextMatchSlot: 1,
          sets: []
        },
        {
          id: 'final-1',
          stage: 'FINAL',
          round: 2,
          matchNumber: 2,
          participant1Id: null,
          participant2Id: null,
          winnerId: null,
          status: 'SCHEDULED' as const,
          nextMatchId: null,
          nextMatchSlot: null,
          sets: []
        }
      ]

      const updated = advanceWinnerInBracket(initialMatches, 'semi-1', 'team-1')

      const updatedSemi = updated.find((m) => m.id === 'semi-1')!
      const updatedFinal = updated.find((m) => m.id === 'final-1')!

      expect(updatedSemi.winnerId).toBe('team-1')
      expect(updatedSemi.status).toBe('FINISHED')
      expect(updatedFinal.participant1Id).toBe('team-1')
      expect(updatedFinal.participant2Id).toBeNull()
    })
  })
})
