import React from "react";
import { Plus, Minus, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerScoreCardProps {
  sideLabel: string;
  playerName: string;
  score: number;
  setsWon: number;
  onScoreChange: (delta: number) => void;
  disabledMinus?: boolean;
  isInLead?: boolean;
}

export const PlayerScoreCard: React.FC<PlayerScoreCardProps> = ({
  sideLabel,
  playerName,
  score,
  setsWon,
  onScoreChange,
  disabledMinus = false,
  isInLead = false,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between rounded-3xl border p-4 sm:p-6 shadow-2xl relative overflow-hidden transition-all",
        isInLead
          ? "border-amber-500/50 bg-gradient-to-b from-collegiate-surface via-collegiate-surface/80 to-collegiate-dark ring-2 ring-amber-500/20 shadow-amber-950/30"
          : "border-collegiate-border bg-gradient-to-b from-collegiate-surface/90 to-collegiate-dark shadow-black/40"
      )}
    >
      {/* Subtle ambient light in the background */}
      <div
        className={cn(
          "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-40",
          isInLead ? "bg-amber-400" : "bg-emerald-500"
        )}
      />

      {/* Header with Side Label and Sets Counters */}
      <div className="w-full text-center pb-1 sm:pb-2 z-10">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300/80">
            {sideLabel}
          </span>

          {/* Visual Set Counter Dots */}
          <div className="flex items-center gap-1.5" title={`${setsWon} sets vencidos`}>
            <span className="text-[10px] font-bold text-amber-400/90 mr-0.5">SETS</span>
            {[0, 1].map((dotIdx) => (
              <span
                key={dotIdx}
                className={cn(
                  "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full border transition-all",
                  dotIdx < setsWon
                    ? "bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-110"
                    : "bg-collegiate-dark/80 border-collegiate-border"
                )}
              />
            ))}
          </div>
        </div>

        <h3 className="text-sm sm:text-lg md:text-xl font-black text-white truncate tracking-tight">
          {playerName || "A Definir"}
        </h3>
      </div>

      {/* Giant LED Score Display */}
      <div className="my-1 sm:my-2.5 flex flex-col items-center justify-center z-10 select-none">
        <div className="relative">
          <span
            key={score}
            className={cn(
              "font-mono text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter tabular-nums block animate-score-pop transition-colors leading-none",
              isInLead
                ? "text-amber-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                : "text-emerald-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]"
            )}
          >
            {score}
          </span>
        </div>
      </div>

      {/* Giant Touch Buttons */}
      <div className="w-full flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2 z-10">
        <button
          type="button"
          onClick={() => onScoreChange(-1)}
          disabled={disabledMinus}
          aria-label="Diminuir ponto"
          className="flex-1 flex items-center justify-center rounded-2xl border border-collegiate-border bg-collegiate-dark/90 py-2.5 sm:py-3.5 text-emerald-200/70 hover:text-white hover:bg-collegiate-surface active:scale-95 disabled:opacity-35 disabled:pointer-events-none transition-all shadow-md"
        >
          <Minus className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          type="button"
          onClick={() => onScoreChange(+1)}
          aria-label="Aumentar ponto"
          className={cn(
            "flex-[2.2] flex items-center justify-center rounded-2xl py-2.5 sm:py-3.5 font-black text-collegiate-dark active:scale-95 transition-all text-lg sm:text-xl border shadow-xl",
            isInLead
              ? "bg-amber-400 hover:bg-amber-300 border-amber-300 shadow-amber-900/40"
              : "bg-emerald-400 hover:bg-emerald-300 border-emerald-300 shadow-emerald-950/50"
          )}
        >
          <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-1 stroke-[3]" />
          <span className="font-extrabold tracking-wide">1</span>
        </button>
      </div>
    </div>
  );
};
