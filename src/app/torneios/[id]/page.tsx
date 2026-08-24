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
import { BracketTree } from "@/components/tournament/BracketTree";
import { GroupTable } from "@/components/tournament/GroupTable";
import { MatchCard } from "@/components/tournament/MatchCard";
import { LiveScoreboardModal } from "@/components/tournament/LiveScoreboardModal";
import { SocialCardModal } from "@/components/tournament/SocialCardModal";
import { formatDateTime, cn, copyToClipboard } from "@/lib/utils";
import { BAIRROS_OLINDA } from "@/lib/olinda";

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
    await copyToClipboard(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = `${window.location.origin}/torneios/${tournamentId}/inscricao`;
    const text = encodeURIComponent(
      `*Inscricoes abertas para o ${tournament?.title} de Futmesa em Olinda/PE!*\nGaranta sua vaga pelo link:\n${url}`
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main Overview Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Summary Card */}
            <div className="rounded-2xl border border-collegiate-border bg-collegiate-surface/90 p-6 space-y-4 shadow-md">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span>Regulamento & Formato da Competição</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-200">
                <div className="rounded-xl bg-collegiate-dark/80 p-3.5 border border-collegiate-border">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Modalidade</span>
                  <p className="font-semibold text-white mt-0.5">
                    {isDuplas ? "Duplas (2x2)" : "Individual (1x1)"}
                  </p>
                </div>

                <div className="rounded-xl bg-collegiate-dark/80 p-3.5 border border-collegiate-border">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Formato</span>
                  <p className="font-semibold text-white mt-0.5">
                    {isGroups ? "Fase de Grupos + Mata-Mata Final" : "Mata-Mata Eliminatório Direto"}
                  </p>
                </div>

                <div className="rounded-xl bg-collegiate-dark/80 p-3.5 border border-collegiate-border">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pontuação do Set</span>
                  <p className="font-semibold text-white mt-0.5">
                    {tournament.pointsPerSet} pontos com vantagem de 2
                  </p>
                </div>

                <div className="rounded-xl bg-collegiate-dark/80 p-3.5 border border-collegiate-border">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Sets por Partida</span>
                  <p className="font-semibold text-white mt-0.5">
                    Melhor de {maxSetsCount} sets ({setsToWinCount} set(s) para vencer)
                  </p>
                </div>
              </div>
            </div>

            {/* Apoiadores / Patrocinadores Locais de Olinda */}
            {tournament.sponsors && (
              <div className="rounded-2xl border border-amber-500/30 bg-collegiate-surface/90 p-6 space-y-3 shadow-md">
                <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                  <Store className="h-5 w-5 text-amber-400" />
                  <span>Apoiadores & Comércio Local de Olinda</span>
                </h3>
                <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
                  {tournament.sponsors}
                </p>
              </div>
            )}

            {/* Rules Summary */}
            <div className="rounded-2xl border border-collegiate-border bg-collegiate-surface/90 p-6 space-y-3 shadow-md">
              <h3 className="text-base font-black text-amber-300">Regras Oficiais do Futmesa em Olinda</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-emerald-100/80 list-disc list-inside">
                <li>Máximo de 3 toques por equipe antes de devolver a bola para o campo adversário.</li>
                <li>Proibido encostar qualquer parte do corpo ou mãos na mesa durante a jogada.</li>
                <li>Saque alternado cruzado a cada 2 pontos com bola lançada com os pés.</li>
                <li>Em caso de empate em {tournament.pointsPerSet - 1}x{tournament.pointsPerSet - 1}, o jogo segue até que um lado abra 2 pontos de vantagem.</li>
                {tournament.rulesNote && (
                  <li className="text-amber-300 font-semibold">{tournament.rulesNote}</li>
                )}
              </ul>
            </div>
          </div>

          {/* Right / Quick Share & Stats Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 to-collegiate-dark p-6 space-y-4 shadow-lg">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" />
                <span>Inscrições da Comunidade</span>
              </h3>
              <p className="text-xs text-emerald-100/70">
                Compartilhe o link do formulário público com alunos, atletas e a comunidade para que façam suas inscrições em 1 clique.
              </p>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={handleCopyRegistrationLink}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs sm:text-sm font-bold text-collegiate-dark shadow-lg shadow-amber-950/40 hover:bg-amber-400 transition-all border border-amber-400"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copiedLink ? "Link Copiado com Sucesso!" : "Copiar Link de Inscrição"}</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-800/80 border border-emerald-500/30 py-2.5 text-xs sm:text-sm font-bold text-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Enviar no WhatsApp</span>
                </button>

                <button
                  onClick={() => setIsSocialCardOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/50 bg-amber-950/30 py-2.5 text-xs sm:text-sm font-bold text-amber-300 hover:bg-amber-900/40 transition-all"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Gerar Card de Stories</span>
                </button>
              </div>
            </div>

            {/* Quick Status Stats */}
            <div className="rounded-2xl border border-collegiate-border bg-collegiate-surface/90 p-5 space-y-3 text-xs shadow-md">
              <h4 className="font-bold uppercase tracking-wider text-amber-300">Resumo do Torneio</h4>
              <div className="flex items-center justify-between py-1 border-b border-collegiate-border">
                <span className="text-emerald-100/70">Inscritos</span>
                <span className="font-bold text-white tabular-nums">{participantsCount}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-collegiate-border">
                <span className="text-emerald-100/70">Partidas</span>
                <span className="font-bold text-white tabular-nums">{matchesCount}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-emerald-100/70">Status</span>
                <span className="font-bold text-amber-400">
                  {tournament.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Bracket */}
      {activeTab === "bracket" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Swords className="h-5 w-5 text-emerald-400" />
              <span>Chaveamento Eliminatório</span>
            </h3>
          </div>

          <BracketTree
            matches={tournament.matches || []}
            onOpenScoreboard={handleOpenScoreboard}
          />
        </div>
      )}

      {/* Tab Content 3: Groups */}
      {activeTab === "groups" && isGroups && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-400" />
              <span>Classificação dos Grupos</span>
            </h3>
          </div>

          {tournament.groups && tournament.groups.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tournament.groups.map((group) => (
                <GroupTable
                  key={group.id}
                  group={group}
                  pointsPerSet={tournament.pointsPerSet}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
              <p className="text-sm text-slate-500">
                Nenhum grupo gerado ainda. Clique em "Sortear Chaves do Torneio" para gerar os grupos.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 4: Matches & Scoreboard */}
      {activeTab === "matches" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-amber-400" />
                <span>Partidas, Mesas & Convocação WhatsApp</span>
              </h3>
              <p className="text-xs text-emerald-100/70">
                Use os botões de aviso no WhatsApp para chamar os atletas para a mesa ou abra o Placar da Mesa
              </p>
            </div>
          </div>

          {tournament.matches && tournament.matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournament.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  tournamentTitle={tournament.title}
                  onOpenScoreboard={handleOpenScoreboard}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
              <p className="text-sm text-slate-500">
                Nenhuma partida gerada ainda. Realize o sorteio das chaves para agendar os jogos.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 5: Participants */}
      {activeTab === "participants" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" />
              <span>Atletas e Duplas Inscritos ({participantsCount})</span>
            </h3>

            <Link
              href={`/torneios/${tournamentId}/inscricao`}
              className="rounded-lg bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-colors shadow"
            >
              + Nova Inscrição
            </Link>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-200/50" />
              <input
                type="text"
                placeholder="Buscar por atleta, apelido, parceiro ou arena..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                className="w-full rounded-xl border border-collegiate-border bg-collegiate-surface pl-9 pr-4 py-2 text-xs text-white placeholder-emerald-100/40 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <select
              value={selectedBairroFilter}
              onChange={(e) => setSelectedBairroFilter(e.target.value)}
              className="rounded-xl border border-collegiate-border bg-collegiate-surface px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="TODOS">Todos os Bairros de Olinda</option>
              {BAIRROS_OLINDA.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {filteredParticipants.length > 0 ? (
            <div className="rounded-2xl border border-collegiate-border bg-collegiate-surface/90 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-collegiate-border bg-collegiate-dark/80 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">#</th>
                      <th className="py-3 px-4">Atleta 1 / Apelido</th>
                      <th className="py-3 px-4">Atleta 2 / Parceiro</th>
                      <th className="py-3 px-4">Bairro / Arena</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-collegiate-border/60">
                    {filteredParticipants.map((p, idx) => {
                      const isConfirmed = p.status === "CONFIRMED" || p.phoneVerified;
                      return (
                        <tr key={p.id} className="hover:bg-collegiate-dark/40 transition-colors">
                          <td className="py-3 px-4 text-center font-mono text-emerald-200/50">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            <div>
                              {p.name}
                              {p.nickname && (
                                <span className="text-amber-400 font-bold ml-1.5 text-xs">
                                  "{p.nickname}"
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-emerald-100/80">
                            {p.partnerName ? (
                              <div>
                                {p.partnerName}
                                {p.partnerNickname && (
                                  <span className="text-amber-400 font-semibold ml-1 text-xs">
                                    "{p.partnerNickname}"
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-emerald-200/40">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-emerald-200/70 text-xs">
                            <span className="font-semibold text-amber-300/90">
                              {p.neighborhood || "Olinda"}
                            </span>
                            {p.communityOrProject && (
                              <div className="text-[11px] text-emerald-100/50">
                                {p.communityOrProject}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isConfirmed ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Verificado</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                                <span>Pendente OTP</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {p.phone ? (
                              <a
                                href={`https://wa.me/55${p.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                  `Salve ${p.nickname || p.name}! Confirmamos sua vaga no ${tournament.title} de Futmesa!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 transition-colors"
                              >
                                <MessageCircle className="h-3 w-3" />
                                <span>WhatsApp</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-emerald-200/40">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-collegiate-border bg-collegiate-surface/40 p-12 text-center space-y-3">
              <p className="text-sm text-emerald-100/60">
                Nenhum participante encontrado para o filtro selecionado.
              </p>
              <Link
                href={`/torneios/${tournamentId}/inscricao`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                <span>Inscrever Novo Atleta</span>
              </Link>
            </div>
          )}
        </div>
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
