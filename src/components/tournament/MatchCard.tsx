"use client";

import React from "react";
import { MatchType } from "@/types/tournament";
import {
  Trophy,
  Clock,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getRoundDisplayName } from "@/lib/tournament-engine";
import { generateMatchWhatsAppNotification } from "@/lib/olinda";

interface MatchCardProps {
  match: MatchType;
  tournamentTitle?: string;
  onOpenScoreboard?: (match: MatchType) => void;
  compact?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  tournamentTitle = "Campeonato de Futmesa",
  onOpenScoreboard,
  compact = false,
}) => {
  const p1Name = match.participant1
    ? match.participant1.partnerName
      ? `${match.participant1.name} & ${match.participant1.partnerName}`
      : match.participant1.name
    : "A definir";

  const p2Name = match.participant2
    ? match.participant2.partnerName
      ? `${match.participant2.name} & ${match.participant2.partnerName}`
      : match.participant2.name
    : "A definir";

  const p1Neighborhood = match.participant1?.neighborhood
    ? ` (${match.participant1.neighborhood})`
    : "";
  const p2Neighborhood = match.participant2?.neighborhood
    ? ` (${match.participant2.neighborhood})`
    : "";

  const isP1Winner =
    match.winnerId && match.participant1 && match.winnerId === match.participant1.id;
  const isP2Winner =
    match.winnerId && match.participant2 && match.winnerId === match.participant2.id;
  const isLive = match.status === "AO_VIVO" || match.status === "IN_PROGRESS";
  const isFinished = match.status === "FINALIZADA" || match.status === "FINISHED";
  const isBye = match.status === "BYE";

  const roundDisplay =
    match.roundName ||
    (match.stage ? getRoundDisplayName(match.stage) : `Rodada ${match.round}`);

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-collegiate-surface/90 transition-all duration-200 shadow-md",
        isLive
          ? "border-amber-500/60 shadow-amber-500/10 ring-1 ring-amber-500/50"
          : "border-collegiate-border hover:border-amber-500/40",
        compact ? "p-3" : "p-4"
      )}
    >
      {/* Header with Court, Round, Status */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-collegiate-border/80 text-xs">
        <div className="flex items-center gap-2 text-emerald-100/70 font-medium truncate">
          {match.court && (
            <span className="rounded bg-collegiate-dark px-1.5 py-0.5 text-[11px] font-bold text-amber-300 border border-collegiate-border">
              {match.court}
            </span>
          )}
          <span className="truncate">{roundDisplay}</span>
          {match.matchNumber && <span className="text-amber-400">#Jogo {match.matchNumber}</span>}
        </div>

        {/* Status Pill */}
        <div>
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30 animate-pulse-live">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
              Ao Vivo
            </span>
          )}
          {isFinished && (
            <span className="inline-flex items-center gap-1 rounded-full bg-collegiate-dark px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-collegiate-border">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Finalizado
            </span>
          )}
          {isBye && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/20">
              BYE (Avanço)
            </span>
          )}
          {!isLive && !isFinished && !isBye && (
            <span className="inline-flex items-center gap-1 rounded-full bg-collegiate-dark/60 px-2 py-0.5 text-[10px] font-medium text-emerald-100/60 border border-collegiate-border">
              <Clock className="h-3 w-3 text-amber-400" />
              Agendada
            </span>
          )}
        </div>
      </div>

      {/* Participants & Scores */}
      <div className="space-y-2">
        {/* Participant 1 */}
        <div
          className={cn(
            "flex items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors",
            isP1Winner
              ? "bg-amber-950/30 border border-amber-500/40 text-white font-semibold"
              : "text-slate-200 bg-collegiate-dark/70"
          )}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            {isP1Winner && <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
            <span
              className={cn(
                "truncate text-sm",
                isP1Winner ? "text-amber-300 font-bold" : "text-slate-200"
              )}
            >
              {p1Name}
              <span className="text-[11px] font-normal text-emerald-200/50">
                {p1Neighborhood}
              </span>
            </span>
          </div>

          {/* Sets display */}
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold shrink-0">
            {match.sets && match.sets.length > 0 ? (
              match.sets.map((set, idx) => (
                <span
                  key={set.id || idx}
                  className={cn(
                    "min-w-[22px] rounded px-1.5 py-0.5 text-center text-xs tabular-nums",
                    set.score1 > set.score2
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black"
                      : "bg-collegiate-dark text-emerald-100/60"
                  )}
                >
                  {set.score1}
                </span>
              ))
            ) : (
              <span className="text-emerald-200/40 font-normal text-xs">-</span>
            )}
          </div>
        </div>

        {/* Participant 2 */}
        <div
          className={cn(
            "flex items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors",
            isP2Winner
              ? "bg-amber-950/30 border border-amber-500/40 text-white font-semibold"
              : "text-slate-200 bg-collegiate-dark/70"
          )}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            {isP2Winner && <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
            <span
              className={cn(
                "truncate text-sm",
                isP2Winner ? "text-amber-300 font-bold" : "text-slate-200"
              )}
            >
              {p2Name}
              <span className="text-[11px] font-normal text-emerald-200/50">
                {p2Neighborhood}
              </span>
            </span>
          </div>

          {/* Sets display */}
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold shrink-0">
            {match.sets && match.sets.length > 0 ? (
              match.sets.map((set, idx) => (
                <span
                  key={set.id || idx}
                  className={cn(
                    "min-w-[22px] rounded px-1.5 py-0.5 text-center text-xs tabular-nums",
                    set.score2 > set.score1
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black"
                      : "bg-collegiate-dark text-emerald-100/60"
                  )}
                >
                  {set.score2}
                </span>
              ))
            ) : (
              <span className="text-emerald-200/40 font-normal text-xs">-</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Summon WhatsApp & Scoreboard */}
      {!isBye && (
        <div className="mt-3 pt-2.5 border-t border-collegiate-border/60 flex flex-wrap items-center justify-between gap-2">
          {/* Quick WhatsApp alerts for players */}
          {!isFinished && (
            <div className="flex items-center gap-1">
              {match.participant1 && (
                <a
                  href={generateMatchWhatsAppNotification({
                    phone: match.participant1.phone,
                    athleteName: p1Name,
                    tournamentTitle,
                    court: match.court,
                    opponentName: p2Name,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 transition-colors"
                  title={`Avisar ${p1Name} no WhatsApp`}
                >
                  <MessageCircle className="h-3 w-3" />
                  <span>Avisar P1</span>
                </a>
              )}

              {match.participant2 && (
                <a
                  href={generateMatchWhatsAppNotification({
                    phone: match.participant2.phone,
                    athleteName: p2Name,
                    tournamentTitle,
                    court: match.court,
                    opponentName: p1Name,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 transition-colors"
                  title={`Avisar ${p2Name} no WhatsApp`}
                >
                  <MessageCircle className="h-3 w-3" />
                  <span>Avisar P2</span>
                </a>
              )}
            </div>
          )}

          {/* Placar button */}
          {onOpenScoreboard && (
            <button
              onClick={() => onOpenScoreboard(match)}
              className="ml-auto flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 rounded-lg px-2.5 py-1 transition-all"
            >
              <PlayCircle className="h-3.5 w-3.5 text-amber-400" />
              <span>{isFinished ? "Ver/Editar Placar" : "Placar da Mesa"}</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
