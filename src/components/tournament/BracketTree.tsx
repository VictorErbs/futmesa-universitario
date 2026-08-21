"use client";

import React from "react";
import { MatchType } from "@/types/tournament";
import { Trophy, Flame, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRoundDisplayName } from "@/lib/tournament-engine";

interface BracketTreeProps {
  matches: MatchType[];
  onOpenScoreboard?: (match: MatchType) => void;
}

export const BracketTree: React.FC<BracketTreeProps> = ({
  matches,
  onOpenScoreboard,
}) => {
  // Filter only playoff/knockout matches (exclude group-only matches if any)
  const knockoutMatches = matches
    .filter((m) => !m.groupId && (!m.stage || m.stage !== "GROUPS"))
    .sort((a, b) => a.round - b.round || (a.matchNumber || 0) - (b.matchNumber || 0));

  if (knockoutMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
        <Trophy className="h-12 w-12 text-slate-600 mb-3" />
        <h3 className="text-lg font-bold text-slate-300">Chaveamento ainda não gerado</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Finalize as inscrições ou clique no botão de sortear chaves para criar a árvore do mata-mata.
        </p>
      </div>
    );
  }

  const totalRounds = Math.max(...knockoutMatches.map((m) => m.round));

  // Group matches by round
  const roundsMap = new Map<number, { name: string; matches: MatchType[] }>();
  knockoutMatches.forEach((m) => {
    if (!roundsMap.has(m.round)) {
      const displayName =
        m.roundName || (m.stage ? getRoundDisplayName(m.stage, totalRounds) : `Rodada ${m.round}`);

      roundsMap.set(m.round, {
        name: displayName,
        matches: [],
      });
    }
    roundsMap.get(m.round)!.matches.push(m);
  });

  const rounds = Array.from(roundsMap.entries()).sort(([rA], [rB]) => rA - rB);

  return (
    <div className="w-full overflow-x-auto pb-6 pt-2">
      <div className="inline-flex min-w-full items-stretch gap-8 px-2 sm:px-4">
        {rounds.map(([roundNum, roundData], roundIndex) => {
          const isFinalRound = roundIndex === rounds.length - 1;

          return (
            <div
              key={roundNum}
              className="flex flex-col min-w-[280px] max-w-[320px] shrink-0"
            >
              {/* Round Header */}
              <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-900/90 border border-slate-800 px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isFinalRound ? "bg-amber-400" : "bg-emerald-400"
                    )}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    {roundData.name}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {roundData.matches.length} {roundData.matches.length === 1 ? "jogo" : "jogos"}
                </span>
              </div>

              {/* Matches in this round */}
              <div className="flex flex-col justify-around flex-grow gap-6">
                {roundData.matches.map((match) => {
                  const p1 = match.participant1;
                  const p2 = match.participant2;

                  const p1Name = p1
                    ? p1.partnerName
                      ? `${p1.name} & ${p1.partnerName}`
                      : p1.name
                    : "A definir";

                  const p2Name = p2
                    ? p2.partnerName
                      ? `${p2.name} & ${p2.partnerName}`
                      : p2.name
                    : "A definir";

                  const isP1Winner =
                    match.winnerId && p1 && match.winnerId === p1.id;
                  const isP2Winner =
                    match.winnerId && p2 && match.winnerId === p2.id;
                  const isLive =
                    match.status === "AO_VIVO" || match.status === "IN_PROGRESS";
                  const isFinished =
                    match.status === "FINALIZADA" || match.status === "FINISHED";
                  const isBye = match.status === "BYE";

                  return (
                    <div
                      key={match.id}
                      className={cn(
                        "relative flex flex-col rounded-xl border bg-slate-900/95 transition-all shadow-md",
                        isLive
                          ? "border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-emerald-500/20"
                          : isFinalRound
                          ? "border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950"
                          : "border-slate-800 hover:border-slate-700"
                      )}
                    >
                      {/* Match top meta */}
                      <div className="flex items-center justify-between border-b border-slate-800/80 px-3 py-1.5 text-[11px]">
                        <span className="text-slate-400 font-medium truncate">
                          {match.court || `Jogo #${match.matchNumber || 1}`}
                        </span>

                        {isLive && (
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-400 uppercase tracking-wider animate-pulse-live">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                            Ao Vivo
                          </span>
                        )}
                        {isFinished && (
                          <span className="text-[10px] font-semibold text-slate-400">
                            Finalizado
                          </span>
                        )}
                        {isBye && (
                          <span className="text-[10px] font-semibold text-amber-400">
                            BYE
                          </span>
                        )}
                      </div>

                      {/* Team 1 */}
                      <div
                        className={cn(
                          "flex items-center justify-between border-b border-slate-800/50 px-3 py-2 text-xs transition-colors",
                          isP1Winner
                            ? "bg-emerald-950/40 text-white font-bold"
                            : "text-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          {isP1Winner && (
                            <Trophy className="h-3 w-3 text-emerald-400 shrink-0" />
                          )}
                          <span
                            className={cn(
                              "truncate",
                              isP1Winner ? "text-emerald-300" : "text-slate-200"
                            )}
                          >
                            {p1Name}
                          </span>
                        </div>

                        {/* Scores */}
                        <div className="flex items-center gap-1 font-mono font-bold shrink-0">
                          {match.sets && match.sets.length > 0 ? (
                            match.sets.map((s, idx) => (
                              <span
                                key={s.id || idx}
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-center text-xs",
                                  s.score1 > s.score2
                                    ? "bg-emerald-500/20 text-emerald-300 font-bold"
                                    : "bg-slate-800 text-slate-400 font-normal"
                                )}
                              >
                                {s.score1}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </div>
                      </div>

                      {/* Team 2 */}
                      <div
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-xs transition-colors",
                          isP2Winner
                            ? "bg-emerald-950/40 text-white font-bold"
                            : "text-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          {isP2Winner && (
                            <Trophy className="h-3 w-3 text-emerald-400 shrink-0" />
                          )}
                          <span
                            className={cn(
                              "truncate",
                              isP2Winner ? "text-emerald-300" : "text-slate-200"
                            )}
                          >
                            {p2Name}
                          </span>
                        </div>

                        {/* Scores */}
                        <div className="flex items-center gap-1 font-mono font-bold shrink-0">
                          {match.sets && match.sets.length > 0 ? (
                            match.sets.map((s, idx) => (
                              <span
                                key={s.id || idx}
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-center text-xs",
                                  s.score2 > s.score1
                                    ? "bg-emerald-500/20 text-emerald-300 font-bold"
                                    : "bg-slate-800 text-slate-400 font-normal"
                                )}
                              >
                                {s.score2}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </div>
                      </div>

                      {/* Scoreboard trigger */}
                      {onOpenScoreboard && !isBye && (
                        <button
                          onClick={() => onOpenScoreboard(match)}
                          className="flex items-center justify-center gap-1.5 border-t border-slate-800 bg-slate-950/80 py-2 text-[11px] font-bold text-emerald-400 hover:bg-emerald-950/60 hover:text-emerald-200 transition-colors"
                        >
                          <PlayCircle className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{isFinished ? "Ver Placar Detalhado" : "Abrir Placar da Mesa"}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
