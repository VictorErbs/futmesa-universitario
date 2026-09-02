"use client";

import React from "react";
import { MatchType } from "@/types/tournament";
import { Trophy, PlayCircle, Crown, Award } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-collegiate-border bg-collegiate-surface/40 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mb-4 border border-amber-500/30 shadow-inner">
          <Trophy className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-black text-white">Chaveamento ainda não gerado</h3>
        <p className="text-sm text-emerald-100/70 max-w-sm mt-1">
          Finalize as inscrições ou clique no botão de sortear chaves para criar a árvore oficial do mata-mata.
        </p>
      </div>
    );
  }

  const totalRounds = Math.max(...knockoutMatches.map((m) => m.round));

  // Find champion if final match is finished
  const finalMatch = knockoutMatches.find(
    (m) => (m.stage === "FINAL" || m.round === totalRounds) && (m.status === "FINISHED" || m.status === "FINALIZADA")
  );
  const champion = finalMatch?.winner;

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
    <div className="w-full space-y-6">
      {/* Champion Celebration Banner if tournament has a winner */}
      {champion && (
        <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/20 via-amber-900/30 to-amber-500/20 p-4 sm:p-5 text-center shadow-xl shadow-amber-950/40 backdrop-blur animate-score-pop">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-collegiate-dark uppercase tracking-widest mb-2 shadow">
            <Crown className="h-3.5 w-3.5 fill-collegiate-dark" />
            <span>Grande Campeão</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            🏆 {champion.name} {champion.partnerName ? `& ${champion.partnerName}` : ""}
          </h2>
          <p className="text-xs text-amber-200/80 mt-1 font-semibold">
            Vencedor do Chaveamento Mata-Mata MesaMatch
          </p>
        </div>
      )}

      {/* Horizontal Bracket Tree Container */}
      <div className="w-full overflow-x-auto pb-8 pt-2">
        <div className="inline-flex min-w-full items-stretch gap-8 sm:gap-12 px-2 sm:px-4">
          {rounds.map(([roundNum, roundData], roundIndex) => {
            const isFinalRound = roundIndex === rounds.length - 1;

            return (
              <div
                key={roundNum}
                className="flex flex-col min-w-[280px] max-w-[320px] shrink-0"
              >
                {/* Round Header Card */}
                <div
                  className={cn(
                    "mb-6 flex items-center justify-between rounded-xl px-4 py-2.5 border shadow-md transition-all",
                    isFinalRound
                      ? "bg-gradient-to-r from-amber-500/20 via-collegiate-surface to-amber-500/10 border-amber-400/60"
                      : "bg-collegiate-surface/90 border-collegiate-border"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        isFinalRound
                          ? "bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-pulse"
                          : "bg-emerald-400"
                      )}
                    />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      {roundData.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-200/60">
                    {roundData.matches.length} {roundData.matches.length === 1 ? "jogo" : "jogos"}
                  </span>
                </div>

                {/* Matches column */}
                <div className="flex flex-col justify-around flex-grow gap-6 sm:gap-8">
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
                          "relative flex flex-col rounded-2xl border transition-all shadow-xl backdrop-blur-sm overflow-hidden",
                          isLive
                            ? "border-emerald-400 ring-2 ring-emerald-400/30 bg-collegiate-surface/95 shadow-emerald-950/40"
                            : isFinalRound
                            ? "border-amber-400/70 bg-gradient-to-b from-amber-950/30 via-collegiate-surface to-collegiate-dark shadow-amber-950/30"
                            : "border-collegiate-border bg-collegiate-surface/85 hover:border-amber-400/40 hover:bg-collegiate-surface"
                        )}
                      >
                        {/* Match Header Meta */}
                        <div
                          className={cn(
                            "flex items-center justify-between border-b px-3.5 py-2 text-[11px] font-bold",
                            isFinalRound
                              ? "border-amber-500/20 bg-amber-950/20 text-amber-300"
                              : "border-collegiate-border/80 bg-collegiate-dark/50 text-emerald-200/70"
                          )}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            {isFinalRound && <Trophy className="h-3.5 w-3.5 text-amber-400" />}
                            <span>{match.court || `Jogo #${match.matchNumber || 1}`}</span>
                          </span>

                          {isLive && (
                            <span className="inline-flex items-center gap-1 font-black text-[10px] text-emerald-400 uppercase tracking-widest animate-pulse-live">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                              Ao Vivo
                            </span>
                          )}
                          {isFinished && (
                            <span className="text-[10px] font-bold text-emerald-300/80">
                              Finalizado
                            </span>
                          )}
                          {isBye && (
                            <span className="text-[10px] font-bold text-amber-400">
                              BYE (Avanço Automático)
                            </span>
                          )}
                        </div>

                        {/* Team 1 Row */}
                        <div
                          className={cn(
                            "flex items-center justify-between border-b border-collegiate-border/60 px-3.5 py-2.5 text-xs transition-colors",
                            isP1Winner
                              ? "bg-amber-500/15 text-white font-black"
                              : "text-emerald-100/90"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            {isP1Winner && (
                              <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            )}
                            <span
                              className={cn(
                                "truncate",
                                isP1Winner ? "text-amber-300 font-extrabold" : "text-emerald-100/90"
                              )}
                            >
                              {p1Name}
                            </span>
                          </div>

                          {/* Scores per set */}
                          <div className="flex items-center gap-1 font-mono font-bold shrink-0">
                            {match.sets && match.sets.length > 0 ? (
                              match.sets.map((s, idx) => (
                                <span
                                  key={s.id || idx}
                                  className={cn(
                                    "rounded-md px-1.5 py-0.5 text-center text-xs tabular-nums",
                                    s.score1 > s.score2
                                      ? "bg-amber-400 text-collegiate-dark font-black shadow-sm"
                                      : "bg-collegiate-dark/80 text-emerald-200/60 font-medium"
                                  )}
                                >
                                  {s.score1}
                                </span>
                              ))
                            ) : (
                              <span className="text-emerald-200/30 text-xs">-</span>
                            )}
                          </div>
                        </div>

                        {/* Team 2 Row */}
                        <div
                          className={cn(
                            "flex items-center justify-between px-3.5 py-2.5 text-xs transition-colors",
                            isP2Winner
                              ? "bg-amber-500/15 text-white font-black"
                              : "text-emerald-100/90"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            {isP2Winner && (
                              <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            )}
                            <span
                              className={cn(
                                "truncate",
                                isP2Winner ? "text-amber-300 font-extrabold" : "text-emerald-100/90"
                              )}
                            >
                              {p2Name}
                            </span>
                          </div>

                          {/* Scores per set */}
                          <div className="flex items-center gap-1 font-mono font-bold shrink-0">
                            {match.sets && match.sets.length > 0 ? (
                              match.sets.map((s, idx) => (
                                <span
                                  key={s.id || idx}
                                  className={cn(
                                    "rounded-md px-1.5 py-0.5 text-center text-xs tabular-nums",
                                    s.score2 > s.score1
                                      ? "bg-amber-400 text-collegiate-dark font-black shadow-sm"
                                      : "bg-collegiate-dark/80 text-emerald-200/60 font-medium"
                                  )}
                                >
                                  {s.score2}
                                </span>
                              ))
                            ) : (
                              <span className="text-emerald-200/30 text-xs">-</span>
                            )}
                          </div>
                        </div>

                        {/* Scoreboard trigger */}
                        {onOpenScoreboard && !isBye && (
                          <button
                            type="button"
                            onClick={() => onOpenScoreboard(match)}
                            className="flex items-center justify-center gap-1.5 border-t border-collegiate-border/80 bg-collegiate-dark/80 py-2.5 text-[11px] font-black text-amber-400 hover:bg-amber-500 hover:text-collegiate-dark transition-all"
                          >
                            <PlayCircle className="h-3.5 w-3.5" />
                            <span>{isFinished ? "Ver Placar Detalhado" : "Abrir Mesa de Arbitragem"}</span>
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
    </div>
  );
};
