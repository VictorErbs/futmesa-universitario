import React from "react";
import { Plus, Minus } from "lucide-react";

interface PlayerScoreCardProps {
  sideLabel: string;
  playerName: string;
  score: number;
  setsWon: number;
  onScoreChange: (delta: number) => void;
  disabledMinus?: boolean;
}

export const PlayerScoreCard: React.FC<PlayerScoreCardProps> = ({
  sideLabel,
  playerName,
  score,
  setsWon,
  onScoreChange,
  disabledMinus = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-between rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Player Name */}
      <div className="w-full text-center pb-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">
          {sideLabel} &bull; Sets: {setsWon}
        </span>
        <h3 className="text-base sm:text-xl font-black text-white truncate">
          {playerName}
        </h3>
      </div>

      {/* Giant Score Display */}
      <div className="my-2 sm:my-4 flex items-center justify-center">
        <span className="font-mono text-7xl sm:text-9xl font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          {score}
        </span>
      </div>

      {/* Giant +1 / -1 Buttons */}
      <div className="w-full flex items-center gap-2 sm:gap-3 pt-2">
        <button
          onClick={() => onScoreChange(-1)}
          disabled={disabledMinus}
          className="flex-1 flex items-center justify-center rounded-2xl bg-slate-800/80 py-4 sm:py-5 text-slate-300 hover:bg-slate-700 active:scale-95 disabled:opacity-30 transition-all"
        >
          <Minus className="h-7 w-7 sm:h-8 sm:w-8" />
        </button>
        <button
          onClick={() => onScoreChange(+1)}
          className="flex-[2] flex items-center justify-center rounded-2xl bg-emerald-600 py-4 sm:py-5 font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 transition-all text-xl sm:text-2xl"
        >
          <Plus className="h-8 w-8 sm:h-9 sm:w-9 mr-1" />
          <span>+1</span>
        </button>
      </div>
    </div>
  );
};
