import { useReducer, useEffect } from "react";
import { MatchType } from "@/types/tournament";
import { isSetFinished, evaluateMatchWinner } from "@/lib/tournament-engine";

export interface SetScore {
  score1: number;
  score2: number;
  isFinished: boolean;
}

export interface ScoreHistoryItem {
  setIndex: number;
  side: 1 | 2;
  delta: number;
}

export interface ScoreboardState {
  sets: SetScore[];
  currentSetIndex: number;
  history: ScoreHistoryItem[];
  isSwapped: boolean;
}

export type ScoreboardAction =
  | { type: "INIT"; match: MatchType; maxSets: number }
  | { type: "SCORE_CHANGE"; side: 1 | 2; delta: number; pointsPerSet: number; maxSets: number }
  | { type: "UNDO" }
  | { type: "TOGGLE_SWAP" }
  | { type: "FINISH_SET"; maxSets: number; pointsPerSet: number }
  | { type: "SET_CURRENT_SET"; index: number };

function initScoreboardState(match: MatchType, maxSets: number): ScoreboardState {
  const initialSets: SetScore[] = [];
  for (let i = 0; i < maxSets; i++) {
    const existing = match.sets && match.sets[i];
    initialSets.push({
      score1: existing ? existing.score1 : 0,
      score2: existing ? existing.score2 : 0,
      isFinished: existing ? existing.isFinished : false,
    });
  }
  
  let currentSetIndex = initialSets.findIndex((s) => !s.isFinished);
  if (currentSetIndex === -1) {
    currentSetIndex = Math.max(0, initialSets.length - 1);
  }

  return {
    sets: initialSets,
    currentSetIndex,
    history: [],
    isSwapped: false,
  };
}

function scoreboardReducer(state: ScoreboardState, action: ScoreboardAction): ScoreboardState {
  switch (action.type) {
    case "INIT":
      return initScoreboardState(action.match, action.maxSets);
    case "SCORE_CHANGE": {
      const { side, delta, pointsPerSet, maxSets } = action;
      
      const matchEvaluation = evaluateMatchWinner(state.sets, maxSets, pointsPerSet);
      if (matchEvaluation.isFinished && delta > 0) return state;

      const nextSets = [...state.sets];
      const s = { ...nextSets[state.currentSetIndex] };

      if (side === 1) {
        s.score1 = Math.max(0, s.score1 + delta);
      } else {
        s.score2 = Math.max(0, s.score2 + delta);
      }

      const check = isSetFinished(s.score1, s.score2, pointsPerSet);
      s.isFinished = check.finished;

      nextSets[state.currentSetIndex] = s;

      const newHistory = delta > 0 
        ? [...state.history, { setIndex: state.currentSetIndex, side, delta }]
        : state.history;

      return {
        ...state,
        sets: nextSets,
        history: newHistory,
      };
    }
    case "UNDO": {
      if (state.history.length === 0) return state;
      const last = state.history[state.history.length - 1];
      const nextSets = [...state.sets];
      const s = { ...nextSets[last.setIndex] };
      
      if (last.side === 1) {
        s.score1 = Math.max(0, s.score1 - last.delta);
      } else {
        s.score2 = Math.max(0, s.score2 - last.delta);
      }
      s.isFinished = false;
      nextSets[last.setIndex] = s;
      
      return {
        ...state,
        sets: nextSets,
        history: state.history.slice(0, -1),
      };
    }
    case "TOGGLE_SWAP": {
      return {
        ...state,
        isSwapped: !state.isSwapped,
      };
    }
    case "FINISH_SET": {
      const nextSets = [...state.sets];
      nextSets[state.currentSetIndex] = {
        ...nextSets[state.currentSetIndex],
        isFinished: true,
      };
      
      const updatedEval = evaluateMatchWinner(nextSets, action.maxSets, action.pointsPerSet);
      let nextIndex = state.currentSetIndex;
      
      if (!updatedEval.isFinished && state.currentSetIndex + 1 < action.maxSets) {
        nextIndex = state.currentSetIndex + 1;
      }
      
      return {
        ...state,
        sets: nextSets,
        currentSetIndex: nextIndex,
      };
    }
    case "SET_CURRENT_SET": {
      return {
        ...state,
        currentSetIndex: action.index,
      };
    }
    default:
      return state;
  }
}

export function useScoreboardState(match: MatchType, maxSets: number, pointsPerSet: number, isOpen: boolean) {
  const [state, dispatch] = useReducer(
    scoreboardReducer,
    { match, maxSets },
    ({ match, maxSets }) => initScoreboardState(match, maxSets)
  );

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "INIT", match, maxSets });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, match.id, maxSets]);

  return { state, dispatch };
}
