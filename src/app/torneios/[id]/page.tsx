"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Trophy,
  ArrowLeft,
  Users,
  Swords,
  Copy,
  Shuffle,
  PlayCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Flame,
  Layers,
  Info,
  MessageCircle,
  Share2,
  Store,
  FileText,
  Search,
} from "lucide-react";
import { TournamentType, MatchType } from "@/types/tournament";
import { LiveScoreboardModal } from "@/components/tournament/LiveScoreboardModal";
import { SocialCardModal } from "@/components/tournament/SocialCardModal";
import { OverviewTab } from "@/components/tournament/tabs/OverviewTab";
import { BracketTab } from "@/components/tournament/tabs/BracketTab";
import { GroupsTab } from "@/components/tournament/tabs/GroupsTab";
import { MatchesTab } from "@/components/tournament/tabs/MatchesTab";
import { ParticipantsTab } from "@/components/tournament/tabs/ParticipantsTab";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

type TabKey = "overview" | "bracket" | "groups" | "matches" | "participants";

export default function TournamentHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const tournamentId = resolvedParams.id;

  const [tournament, setTournament] = useState<TournamentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawSuccess, setDrawSuccess] = useState<string | null>(null);

  // Scoreboard & Social card modal state
  const [selectedMatch, setSelectedMatch] = useState<MatchType | null>(null);
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
  const [isSocialCardOpen, setIsSocialCardOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter for participants
  const [participantSearch, setParticipantSearch] = useState("");
  const [selectedBairroFilter, setSelectedBairroFilter] = useState("TODOS");

  const fetchTournamentData = async () => {
    try {
      const res = await fetch(`/api/torneios/${tournamentId}`);
      if (!res.ok) throw new Error("Torneio não encontrado.");
      const data = await res.json();
      setTournament(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentData();
  }, [tournamentId]);

  const handleDrawBracket = async () => {
    if (
      !confirm(
        "Deseja realizar o sorteio das chaves agora? Se já existirem jogos, eles serão reinicializados."
      )
    ) {
      return;
    }

    setIsDrawing(true);
    setDrawSuccess(null);
    setError(null);

    try {
      const res = await fetch(`/api/torneios/${tournamentId}/sortear`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao realizar sorteio.");

      setDrawSuccess("Chaves sorteadas com sucesso!");
      await fetchTournamentData();
      setActiveTab("bracket");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDrawing(false);
    }
  };

  const handleCopyRegistrationLink = async () => {
    const url = `${window.location.origin}/torneios/${tournamentId}/inscricao`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = `${window.location.origin}/torneios/${tournamentId}/inscricao`;
    const text = encodeURIComponent(
      `🏆 Inscrições abertas para o *${tournament?.title}* de MesaMatch! Garanta sua vaga pelo link:\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleOpenScoreboard = (match: MatchType) => {
    setSelectedMatch(match);
    setIsScoreboardOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <span className="text-sm font-semibold text-emerald-100/70">
            Carregando painel do torneio comunitário...
          </span>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Torneio não encontrado</h2>
        <p className="text-sm text-slate-400">{error || "Verifique o link acessado."}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para a Home</span>
        </Link>
      </div>
    );
  }

  const isGroups =
    tournament.format === "GRUPOS_E_MATA_MATA" ||
    tournament.format === "GROUPS_AND_KNOCKOUT";
  const isDuplas =
    tournament.modality === "DUPLAS" ||
    tournament.modality === "DOUBLES" ||
    tournament.modality === "2x2";

  const participantsCount = tournament.participants?.length || 0;
  const matchesCount = tournament.matches?.length || 0;
  const maxSetsCount = tournament.maxSets || (tournament.setsToWin === 1 ? 1 : 3);
  const setsToWinCount = tournament.setsToWin || Math.ceil(maxSetsCount / 2);

  // Filtered participants list
  const filteredParticipants = (tournament.participants || []).filter((p) => {
    const matchesQuery =
      participantSearch === "" ||
      p.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
      (p.nickname && p.nickname.toLowerCase().includes(participantSearch.toLowerCase())) ||
      (p.partnerName && p.partnerName.toLowerCase().includes(participantSearch.toLowerCase())) ||
      (p.partnerNickname && p.partnerNickname.toLowerCase().includes(participantSearch.toLowerCase())) ||
      (p.communityOrProject && p.communityOrProject.toLowerCase().includes(participantSearch.toLowerCase()));

    const matchesBairro =
      selectedBairroFilter === "TODOS" || p.neighborhood === selectedBairroFilter;

    return matchesQuery && matchesBairro;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-200/70 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para todos os campeonatos</span>
        </Link>

        {/* Quick public registration & social buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSocialCardOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-900/60 transition-colors shadow-sm"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Card Stories / Status</span>
          </button>
          <button
            onClick={handleCopyRegistrationLink}
            className="flex items-center gap-1.5 rounded-lg border border-collegiate-border bg-collegiate-surface px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-collegiate-surfaceHover transition-colors"
          >
            <Copy className="h-3.5 w-3.5 text-amber-400" />
            <span>{copiedLink ? "Link Copiado!" : "Copiar Inscrição"}</span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Tournament Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-collegiate-border bg-gradient-to-r from-collegiate-dark via-collegiate-surface/90 to-collegiate-dark p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                {isDuplas ? "2x2 Duplas" : "1x1 Individual"}
              </span>
              <span className="rounded-md bg-collegiate-surface border border-collegiate-border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                {isGroups ? "Grupos + Mata-Mata" : "Mata-Mata Eliminatório"}
              </span>
              <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                Sets até {tournament.pointsPerSet} pts (Melhor de {maxSetsCount})
              </span>
              {tournament.community && (
                <span className="rounded-md bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                  📍 {tournament.community}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {tournament.title}
            </h1>

            {tournament.description && (
              <p className="text-sm text-emerald-100/80 leading-relaxed font-normal">
                {tournament.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-emerald-200/70 pt-1">
              {tournament.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  <span className="text-slate-300">{tournament.location}</span>
                </div>
              )}
              {tournament.startDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  <span className="text-slate-300">{formatDateTime(tournament.startDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Drawer */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {matchesCount === 0 ? (
              <button
                onClick={handleDrawBracket}
                disabled={isDrawing || participantsCount < 2}
                className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-collegiate-dark shadow-xl shadow-amber-900/30 hover:bg-amber-400 active:scale-95 disabled:opacity-50 transition-all border border-amber-400"
              >
                <Shuffle className="h-4 w-4" />
                <span>{isDrawing ? "Gerando Chaves..." : "Sortear Chaves do Torneio"}</span>
              </button>
            ) : (
              <button
                onClick={handleDrawBracket}
                disabled={isDrawing}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-collegiate-border bg-collegiate-surface px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-collegiate-surfaceHover transition-all"
              >
                <Shuffle className="h-3.5 w-3.5 text-amber-400" />
                <span>Re-sortear Chaveamento</span>
              </button>
            )}

            <Link
              href={`/torneios/${tournamentId}/inscricao`}
              className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-6 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-900/60 transition-all text-center"
            >
              <Users className="h-4 w-4" />
              <span>Inscrição Pública (WhatsApp)</span>
            </Link>
          </div>
        </div>

        {drawSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{drawSuccess}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-collegiate-border overflow-x-auto">
        <nav className="flex items-center gap-2 sm:gap-4 py-1 min-w-max">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === "overview"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                : "text-emerald-100/60 hover:text-white hover:bg-collegiate-surface"
            )}
          >
            <Info className="h-4 w-4" />
            <span>Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab("bracket")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === "bracket"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                : "text-emerald-100/60 hover:text-white hover:bg-collegiate-surface"
            )}
          >
            <Swords className="h-4 w-4" />
            <span>Chaveamento Mata-Mata</span>
          </button>

          {isGroups && (
            <button
              onClick={() => setActiveTab("groups")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === "groups"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                  : "text-emerald-100/60 hover:text-white hover:bg-collegiate-surface"
              )}
            >
              <Layers className="h-4 w-4" />
              <span>Grupos ({tournament.groups?.length || 0})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("matches")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === "matches"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                : "text-emerald-100/60 hover:text-white hover:bg-collegiate-surface"
            )}
          >
            <Flame className="h-4 w-4" />
            <span>Partidas & Mesas ({matchesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("participants")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === "participants"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                : "text-emerald-100/60 hover:text-white hover:bg-collegiate-surface"
            )}
          >
            <Users className="h-4 w-4" />
            <span>Inscritos ({participantsCount})</span>
          </button>
        </nav>
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === "overview" && (
        <OverviewTab
          tournament={tournament}
          isDuplas={isDuplas}
          isGroups={isGroups}
          maxSetsCount={maxSetsCount}
          setsToWinCount={setsToWinCount}
          participantsCount={participantsCount}
          matchesCount={matchesCount}
          copiedLink={copiedLink}
          onCopyRegistrationLink={handleCopyRegistrationLink}
          onShareWhatsApp={handleShareWhatsApp}
        />
      )}

      {/* Tab Content 2: Bracket */}
      {activeTab === "bracket" && (
        <BracketTab
          matches={tournament.matches || []}
          pointsPerSet={tournament.pointsPerSet}
          setsToWin={tournament.setsToWin}
          onOpenScoreboard={handleOpenScoreboard}
          onMatchUpdated={fetchTournamentData}
        />
      )}

      {/* Tab Content 3: Groups */}
      {activeTab === "groups" && isGroups && (
        <GroupsTab
          groups={tournament.groups || []}
          pointsPerSet={tournament.pointsPerSet}
        />
      )}

      {/* Tab Content 4: Matches & Scoreboard */}
      {activeTab === "matches" && (
        <MatchesTab
          matches={tournament.matches || []}
          onOpenScoreboard={handleOpenScoreboard}
        />
      )}

      {/* Tab Content 5: Participants */}
      {activeTab === "participants" && (
        <ParticipantsTab
          participants={tournament.participants || []}
          participantsCount={participantsCount}
          tournamentId={tournamentId}
        />
      )}

      {/* Live Scoreboard Modal */}
      {selectedMatch && (
        <LiveScoreboardModal
          match={selectedMatch}
          pointsPerSet={tournament.pointsPerSet}
          maxSets={maxSetsCount}
          isOpen={isScoreboardOpen}
          onClose={() => {
            setIsScoreboardOpen(false);
            setSelectedMatch(null);
          }}
          onMatchUpdated={fetchTournamentData}
        />
      )}

      {/* Social Card Modal */}
      <SocialCardModal
        tournament={tournament}
        isOpen={isSocialCardOpen}
        onClose={() => setIsSocialCardOpen(false)}
      />
    </div>
  );
}
