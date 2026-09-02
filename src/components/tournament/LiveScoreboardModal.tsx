"use client";

import React, { useState } from "react";
import { MatchType } from "@/types/tournament";
import { getScoreState, isSetFinished, evaluateMatchWinner } from "@/lib/tournament-engine";
import confetti from "canvas-confetti";
import {
  X,
  RotateCcw,
  ArrowLeftRight,
  Trophy,
  CheckCircle,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScoreboardState } from "./useScoreboardState";
import { PlayerScoreCard } from "./PlayerScoreCard";

interface LiveScoreboardModalProps {
  match: MatchType;
  pointsPerSet?: number;
  maxSets?: number;
  isOpen: boolean;
  onClose: () => void;
  onMatchUpdated?: () => void;
}

export const LiveScoreboardModal: React.FC<LiveScoreboardModalProps> = ({
  match,
  pointsPerSet = 18,
  maxSets = 3,
  isOpen,
  onClose,
  onMatchUpdated,
}) => {
  const { state, dispatch } = useScoreboardState(match, maxSets, pointsPerSet, isOpen);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const { sets, currentSetIndex, history, isSwapped } = state;

  const p1 = match.participant1;
  const p2 = match.participant2;

  const p1DisplayName = p1
    ? p1.partnerName
      ? `${p1.name} & ${p1.partnerName}`
      : p1.name
    : "Jogador / Dupla 1";

  const p2DisplayName = p2
    ? p2.partnerName
      ? `${p2.name} & ${p2.partnerName}`
      : p2.name
    : "Jogador / Dupla 2";

  const currentSet = sets[currentSetIndex] || { score1: 0, score2: 0, isFinished: false };
  const scoreState = getScoreState(currentSet.score1, currentSet.score2, pointsPerSet);
  const setEvaluation = isSetFinished(currentSet.score1, currentSet.score2, pointsPerSet);
  const matchEvaluation = evaluateMatchWinner(sets, maxSets, pointsPerSet);

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399", "#f59e0b", "#3b82f6", "#ffffff"],
      });
    } catch {
      // safe fallback
    }
  };

  const handleScoreChange = (side: 1 | 2, delta: number) => {
    dispatch({ type: "SCORE_CHANGE", side, delta, pointsPerSet, maxSets });

    // Extract the latest scores to sync properly
    const newScore1 = side === 1 ? Math.max(0, currentSet.score1 + delta) : currentSet.score1;
    const newScore2 = side === 2 ? Math.max(0, currentSet.score2 + delta) : currentSet.score2;
    
    // Auto-save live point in background
    syncLiveScore(
      side === 1 ? newScore1 : currentSet.score1,
      side === 2 ? newScore2 : currentSet.score2
    );
  };

  const handleUndo = () => {
    dispatch({ type: "UNDO" });
  };

  const handleFinishSet = () => {
    dispatch({ type: "FINISH_SET", maxSets, pointsPerSet });
    
    // Evaluate if match is finished after dispatching
    // We can't immediately see the new state here easily without duplicating logic,
    // so we evaluate the NEXT state simulating the finish.
    const nextSets = [...sets];
    if (nextSets[currentSetIndex]) {
      nextSets[currentSetIndex] = { ...nextSets[currentSetIndex], isFinished: true };
    }
    const updatedEval = evaluateMatchWinner(nextSets, maxSets, pointsPerSet);

    if (updatedEval.isFinished) {
      fireConfetti();
    }
  };

  // Sync to database
  const syncLiveScore = async (score1: number, score2: number) => {
    try {
      await fetch(`/api/partidas/${match.id}/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setNumber: currentSetIndex + 1,
          score1,
          score2,
        }),
      });
    } catch {
      // quiet live ping
    }
  };

  const handleSaveAndFinalize = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch(`/api/partidas/${match.id}/resultado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sets: sets.map((s, idx) => ({
            setNumber: idx + 1,
            score1: s.score1,
            score2: s.score2,
            isFinished: s.isFinished || isSetFinished(s.score1, s.score2, pointsPerSet).finished,
          })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao salvar resultado");
      }

      setSaveMessage("Resultado salvo com sucesso!");
      fireConfetti();
      if (onMatchUpdated) onMatchUpdated();

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setSaveMessage(`Erro: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const leftSide = isSwapped ? 2 : 1;
  const rightSide = isSwapped ? 1 : 2;

  const leftName = leftSide === 1 ? p1DisplayName : p2DisplayName;
  const rightName = rightSide === 1 ? p1DisplayName : p2DisplayName;

  const leftScore = leftSide === 1 ? currentSet.score1 : currentSet.score2;
  const rightScore = rightSide === 1 ? currentSet.score1 : currentSet.score2;

  const leftSetsWon = leftSide === 1 ? matchEvaluation.setsWonP1 : matchEvaluation.setsWonP2;
  const rightSetsWon = rightSide === 1 ? matchEvaluation.setsWonP1 : matchEvaluation.setsWonP2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-700 bg-slate-950 p-4 sm:p-6 shadow-2xl flex flex-col justify-between max-h-[96vh]">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Placar Digital da Mesa
                </h2>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  {match.court || "Mesa 1"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {match.roundName || "Mata-mata"} &bull; Regra: {pointsPerSet} pts (Diferença de 2)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Set Selector Tabs */}
        <div className="my-3 flex items-center justify-between gap-2 overflow-x-auto py-1">
          <div className="flex items-center gap-2">
            {sets.map((s, idx) => {
              const isCurr = idx === currentSetIndex;
              return (
                <button
                  key={idx}
                  onClick={() => dispatch({ type: "SET_CURRENT_SET", index: idx })}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 sm:px-4 py-1.5 text-xs font-bold transition-all",
                    isCurr
                      ? "bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/30 scale-105"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
                  )}
                >
                  <span>SET {idx + 1}</span>
                  <span className="font-mono text-[11px] opacity-80">
                    ({s.score1} - {s.score2})
                  </span>
                  {s.isFinished && <CheckCircle className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>

          {/* Quick Actions: Inverter lados, Desfazer */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => dispatch({ type: "TOGGLE_SWAP" })}
              title="Inverter Lados da Mesa"
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Inverter Lados</span>
            </button>
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              title="Desfazer último ponto"
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Desfazer</span>
            </button>
          </div>
        </div>

        {/* Live Status Pill (Deuce / Set Point / Status) */}
        <div className="mb-3 flex items-center justify-center">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs sm:text-sm font-bold tracking-wide transition-all",
              scoreState.isDeuce
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 amber-glow"
                : scoreState.advantage
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 pitch-glow"
                : "bg-slate-900 text-slate-300 border border-slate-800"
            )}
          >
            <Flame className="h-4 w-4" />
            <span>{scoreState.statusText}</span>
          </div>
        </div>

        {/* Main Big Scoreboard Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 my-auto">
          <PlayerScoreCard
            sideLabel={leftSide === 1 ? "Lado 1" : "Lado 2"}
            playerName={leftName}
            score={leftScore}
            setsWon={leftSetsWon}
            onScoreChange={(delta) => handleScoreChange(leftSide, delta)}
            disabledMinus={leftScore === 0}
          />
          <PlayerScoreCard
            sideLabel={rightSide === 1 ? "Lado 1" : "Lado 2"}
            playerName={rightName}
            score={rightScore}
            setsWon={rightSetsWon}
            onScoreChange={(delta) => handleScoreChange(rightSide, delta)}
            disabledMinus={rightScore === 0}
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Match finished indicator or message */}
          <div>
            {saveMessage && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-lg">
                {saveMessage}
              </span>
            )}
            {matchEvaluation.isFinished && (
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Trophy className="h-4 w-4" />
                <span>
                  Vitória de:{" "}
                  {matchEvaluation.winnerSlot === 1 ? p1DisplayName : p2DisplayName}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {setEvaluation.finished && !currentSet.isFinished && (
              <button
                onClick={handleFinishSet}
                className="flex-1 sm:flex-initial rounded-xl bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
              >
                Confirmar Fim do Set {currentSetIndex + 1}
              </button>
            )}

            <button
              onClick={handleSaveAndFinalize}
              disabled={isSaving}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 transition-all"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isSaving ? "Salvando..." : "Salvar & Encerrar Partida"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
