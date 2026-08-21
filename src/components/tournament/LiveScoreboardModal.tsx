"use client";

import React, { useState, useEffect } from "react";
import { MatchType, MatchSetType } from "@/types/tournament";
import { getScoreState, isSetFinished, evaluateMatchWinner } from "@/lib/tournament-engine";
import confetti from "canvas-confetti";
import {
  X,
  Plus,
  Minus,
  RotateCcw,
  ArrowLeftRight,
  Trophy,
  CheckCircle,
  AlertCircle,
  Flame,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveScoreboardModalProps {
  match: MatchType;
  pointsPerSet?: number;
  maxSets?: number;
  isOpen: boolean;
  onClose: () => void;
  onMatchUpdated?: () => void;
}

interface ScoreHistoryItem {
  setIndex: number;
  side: 1 | 2;
  delta: number;
}

export const LiveScoreboardModal: React.FC<LiveScoreboardModalProps> = ({
  match,
  pointsPerSet = 18,
  maxSets = 3,
  isOpen,
  onClose,
  onMatchUpdated,
}) => {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isSwapped, setIsSwapped] = useState(false); // Inverter lados visualmente
  const [history, setHistory] = useState<ScoreHistoryItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Initialize or copy sets
  const initialSets: { score1: number; score2: number; isFinished: boolean }[] = [];
  const neededWins = Math.ceil(maxSets / 2);

  for (let i = 0; i < maxSets; i++) {
    const existing = match.sets && match.sets[i];
    initialSets.push({
      score1: existing ? existing.score1 : 0,
      score2: existing ? existing.score2 : 0,
      isFinished: existing ? existing.isFinished : false,
    });
  }

  const [sets, setSets] = useState(initialSets);

  // Synchronize when match prop changes
  useEffect(() => {
    if (match.sets && match.sets.length > 0) {
      const updated: { score1: number; score2: number; isFinished: boolean }[] = [];
      for (let i = 0; i < maxSets; i++) {
        const existing = match.sets[i];
        updated.push({
          score1: existing ? existing.score1 : 0,
          score2: existing ? existing.score2 : 0,
          isFinished: existing ? existing.isFinished : false,
        });
      }
      setSets(updated);

      // Find first unfinished set
      const firstUnfinished = updated.findIndex((s) => !s.isFinished);
      if (firstUnfinished !== -1) {
        setCurrentSetIndex(firstUnfinished);
      } else {
        setCurrentSetIndex(Math.max(0, updated.length - 1));
      }
    }
  }, [match, maxSets]);

  if (!isOpen) return null;

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

  // Trigger confetti on full match victory
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
    if (matchEvaluation.isFinished && delta > 0) return;

    setSets((prev) => {
      const next = [...prev];
      const s = { ...next[currentSetIndex] };

      if (side === 1) {
        s.score1 = Math.max(0, s.score1 + delta);
      } else {
        s.score2 = Math.max(0, s.score2 + delta);
      }

      // Check if this point wins the set
      const check = isSetFinished(s.score1, s.score2, pointsPerSet);
      s.isFinished = check.finished;

      next[currentSetIndex] = s;
      return next;
    });

    if (delta > 0) {
      setHistory((prev) => [...prev, { setIndex: currentSetIndex, side, delta }]);
    }

    // Auto-save live point in background
    syncLiveScore(
      side === 1 ? Math.max(0, currentSet.score1 + delta) : currentSet.score1,
      side === 2 ? Math.max(0, currentSet.score2 + delta) : currentSet.score2
    );
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];

    setSets((prev) => {
      const next = [...prev];
      const s = { ...next[last.setIndex] };
      if (last.side === 1) {
        s.score1 = Math.max(0, s.score1 - last.delta);
      } else {
        s.score2 = Math.max(0, s.score2 - last.delta);
      }
      s.isFinished = false;
      next[last.setIndex] = s;
      return next;
    });

    setHistory((prev) => prev.slice(0, prev.length - 1));
  };

  const handleFinishSet = () => {
    setSets((prev) => {
      const next = [...prev];
      next[currentSetIndex] = {
        ...next[currentSetIndex],
        isFinished: true,
      };
      return next;
    });

    // Check if match is finished
    const updatedEval = evaluateMatchWinner(
      sets.map((s, idx) => (idx === currentSetIndex ? { ...s, isFinished: true } : s)),
      maxSets,
      pointsPerSet
    );

    if (updatedEval.isFinished) {
      fireConfetti();
    } else if (currentSetIndex + 1 < maxSets) {
      setCurrentSetIndex(currentSetIndex + 1);
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

  // Left vs Right visual mapping based on invert sides
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
                  onClick={() => setCurrentSetIndex(idx)}
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
              onClick={() => setIsSwapped(!isSwapped)}
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

        {/* Main Big Scoreboard Grid (Touch friendly) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 my-auto">
          {/* LADO ESQUERDO */}
          <div className="flex flex-col items-center justify-between rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Player Name */}
            <div className="w-full text-center pb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">
                {leftSide === 1 ? "Lado 1" : "Lado 2"} &bull; Sets: {leftSetsWon}
              </span>
              <h3 className="text-base sm:text-xl font-black text-white truncate">
                {leftName}
              </h3>
            </div>

            {/* Giant Score Display */}
            <div className="my-2 sm:my-4 flex items-center justify-center">
              <span className="font-mono text-7xl sm:text-9xl font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                {leftScore}
              </span>
            </div>

            {/* Giant +1 / -1 Buttons */}
            <div className="w-full flex items-center gap-2 sm:gap-3 pt-2">
              <button
                onClick={() => handleScoreChange(leftSide, -1)}
                disabled={leftScore === 0}
                className="flex-1 flex items-center justify-center rounded-2xl bg-slate-800/80 py-4 sm:py-5 text-slate-300 hover:bg-slate-700 active:scale-95 disabled:opacity-30 transition-all"
              >
                <Minus className="h-7 w-7 sm:h-8 sm:w-8" />
              </button>
              <button
                onClick={() => handleScoreChange(leftSide, +1)}
                className="flex-[2] flex items-center justify-center rounded-2xl bg-emerald-600 py-4 sm:py-5 font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 transition-all text-xl sm:text-2xl"
              >
                <Plus className="h-8 w-8 sm:h-9 sm:w-9 mr-1" />
                <span>+1</span>
              </button>
            </div>
          </div>

          {/* LADO DIREITO */}
          <div className="flex flex-col items-center justify-between rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Player Name */}
            <div className="w-full text-center pb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">
                {rightSide === 1 ? "Lado 1" : "Lado 2"} &bull; Sets: {rightSetsWon}
              </span>
              <h3 className="text-base sm:text-xl font-black text-white truncate">
                {rightName}
              </h3>
            </div>

            {/* Giant Score Display */}
            <div className="my-2 sm:my-4 flex items-center justify-center">
              <span className="font-mono text-7xl sm:text-9xl font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                {rightScore}
              </span>
            </div>

            {/* Giant +1 / -1 Buttons */}
            <div className="w-full flex items-center gap-2 sm:gap-3 pt-2">
              <button
                onClick={() => handleScoreChange(rightSide, -1)}
                disabled={rightScore === 0}
                className="flex-1 flex items-center justify-center rounded-2xl bg-slate-800/80 py-4 sm:py-5 text-slate-300 hover:bg-slate-700 active:scale-95 disabled:opacity-30 transition-all"
              >
                <Minus className="h-7 w-7 sm:h-8 sm:w-8" />
              </button>
              <button
                onClick={() => handleScoreChange(rightSide, +1)}
                className="flex-[2] flex items-center justify-center rounded-2xl bg-emerald-600 py-4 sm:py-5 font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 transition-all text-xl sm:text-2xl"
              >
                <Plus className="h-8 w-8 sm:h-9 sm:w-9 mr-1" />
                <span>+1</span>
              </button>
            </div>
          </div>
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
