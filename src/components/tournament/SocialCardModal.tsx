"use client";

import React, { useState } from "react";
import { TournamentType, ParticipantType } from "@/types/tournament";
import { Trophy, X, Share2, Medal, MapPin, Sparkles, Check, Download } from "lucide-react";
import { formatDateShort, copyToClipboard } from "@/lib/utils";

interface SocialCardModalProps {
  tournament: TournamentType;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialCardModal: React.FC<SocialCardModalProps> = ({
  tournament,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Find champion and finalists if finished
  const finalMatch = tournament.matches?.find(
    (m) =>
      (m.stage === "FINAL" || m.roundName?.toLowerCase().includes("final")) &&
      (m.status === "FINALIZADA" || m.status === "FINISHED")
  );

  const champion = finalMatch?.winner;
  const runnerUp =
    finalMatch?.participant1Id === finalMatch?.winnerId
      ? finalMatch?.participant2
      : finalMatch?.participant1;

  const thirdPlaceMatch = tournament.matches?.find(
    (m) =>
      m.stage === "THIRD_PLACE" &&
      (m.status === "FINALIZADA" || m.status === "FINISHED")
  );
  const thirdPlace = thirdPlaceMatch?.winner;

  const isDuplas =
    tournament.modality === "DUPLAS" ||
    tournament.modality === "DOUBLES" ||
    tournament.modality === "2x2";

  const formatParticipantName = (p?: ParticipantType | null) => {
    if (!p) return "A definir";
    const nick1 = p.nickname ? ` "${p.nickname}"` : "";
    const name1 = `${p.name}${nick1}`;
    if (p.partnerName) {
      const nick2 = p.partnerNickname ? ` "${p.partnerNickname}"` : "";
      return `${name1} & ${p.partnerName}${nick2}`;
    }
    return name1;
  };

  const handleShareStory = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: tournament.title,
          text: `🏆 Resultados do ${tournament.title} de Futmesa (Olinda/PE)!`,
          url: window.location.href,
        });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }
    
    await copyToClipboard(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl border border-amber-500/40 bg-collegiate-dark p-6 text-white shadow-2xl space-y-5 my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-collegiate-surface p-2 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
            Card Social • Stories & Status
          </span>
          <h2 className="text-xl font-black">Divulgação Comunitária</h2>
        </div>

        {/* The Card to be shared / screenshot */}
        <div
          id="social-story-card"
          className="relative overflow-hidden rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-slate-900 via-emerald-950/80 to-slate-950 p-6 shadow-2xl text-center space-y-4"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-32 w-48 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />

          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
              <span>Circuito Futmesa Olinda/PE</span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white leading-tight">
              {tournament.title}
            </h3>
            <p className="text-xs text-emerald-200/80 flex items-center justify-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span>{tournament.location || tournament.community || "Olinda, PE"}</span>
            </p>
          </div>

          {/* Podium / Highlights */}
          <div className="space-y-2.5 pt-2">
            {/* 1st Place */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/30 via-amber-400/20 to-amber-500/30 border border-amber-400/60 p-3 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-left">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black shrink-0 shadow">
                    🥇
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-300">
                      Campeão do Torneio
                    </div>
                    <div className="text-sm font-black text-white">
                      {formatParticipantName(champion)}
                    </div>
                    {champion?.neighborhood && (
                      <div className="text-[10px] text-amber-200/80 font-medium">
                        Bairro: {champion.neighborhood}
                      </div>
                    )}
                  </div>
                </div>
                <Trophy className="h-6 w-6 text-amber-400 shrink-0" />
              </div>
            </div>

            {/* 2nd Place */}
            {runnerUp && (
              <div className="rounded-xl bg-slate-800/80 border border-slate-700/80 p-2.5 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥈</span>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Vice-Campeão
                    </div>
                    <div className="text-xs font-bold text-slate-200">
                      {formatParticipantName(runnerUp)}
                    </div>
                  </div>
                </div>
                {runnerUp.neighborhood && (
                  <span className="text-[10px] text-slate-400">
                    {runnerUp.neighborhood}
                  </span>
                )}
              </div>
            )}

            {/* 3rd Place */}
            {thirdPlace && (
              <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-2 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <span className="text-base">🥉</span>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-amber-600">
                      3º Lugar
                    </div>
                    <div className="text-xs font-semibold text-slate-300">
                      {formatParticipantName(thirdPlace)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sponsors Footer on Card */}
          {tournament.sponsors && (
            <div className="pt-2 border-t border-collegiate-border/80">
              <span className="text-[9px] uppercase tracking-wider font-bold text-amber-300/80 block">
                Apoio Comunitário:
              </span>
              <p className="text-[11px] text-emerald-100/80 font-medium mt-0.5">
                {tournament.sponsors}
              </p>
            </div>
          )}

          <div className="text-[9px] text-emerald-200/50 font-mono">
            {formatDateShort(tournament.startDate || tournament.createdAt)} • Olinda/PE
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleShareStory}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 py-3 text-sm font-bold text-slate-950 shadow-lg transition-all"
          >
            <Share2 className="h-4 w-4" />
            <span>{copied ? "Link Copiado para o Clipboard!" : "Compartilhar Link / Print"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
