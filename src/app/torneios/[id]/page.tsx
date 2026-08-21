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
} from "lucide-react";
import { TournamentType, MatchType } from "@/types/tournament";
import { BracketTree } from "@/components/tournament/BracketTree";
import { GroupTable } from "@/components/tournament/GroupTable";
import { MatchCard } from "@/components/tournament/MatchCard";
import { LiveScoreboardModal } from "@/components/tournament/LiveScoreboardModal";
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

  // Scoreboard modal state
  const [selectedMatch, setSelectedMatch] = useState<MatchType | null>(null);
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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

  const handleCopyRegistrationLink = () => {
    const url = `${window.location.origin}/torneios/${tournamentId}/inscricao`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = `${window.location.origin}/torneios/${tournamentId}/inscricao`;
    const text = encodeURIComponent(
      `🏆 Inscrições abertas para o *${tournament?.title}* de Futmesa! Garanta sua vaga pelo link:\n${url}`
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
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <span className="text-sm font-semibold text-slate-400">
            Carregando painel do torneio...
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para todos os torneios</span>
        </Link>

        {/* Quick public registration CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRegistrationLink}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Copy className="h-3.5 w-3.5 text-emerald-400" />
            <span>{copiedLink ? "Link Copiado!" : "Copiar Link de Inscrição"}</span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors shadow"
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
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {tournament.title}
            </h1>

            {tournament.description && (
              <p className="text-sm text-emerald-100/70 leading-relaxed font-normal">
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
              <span>Página de Inscrição Pública</span>
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
            <span>Partidas & Placar ({matchesCount})</span>
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

            {/* Rules Summary */}
            <div className="rounded-2xl border border-collegiate-border bg-collegiate-surface/90 p-6 space-y-3 shadow-md">
              <h3 className="text-base font-black text-amber-300">Regras Oficiais do Futmesa Aplicadas</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-emerald-100/80 list-disc list-inside">
                <li>Máximo de 3 toques por equipe antes de devolver a bola para o campo adversário.</li>
                <li>Proibido encostar qualquer parte do corpo ou mãos na mesa durante a jogada.</li>
                <li>Saque alternado cruzado a cada 2 pontos com bola lançada com os pés.</li>
                <li>Em caso de empate em {tournament.pointsPerSet - 1}x{tournament.pointsPerSet - 1}, o jogo segue até que um lado abra 2 pontos de vantagem.</li>
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
                <PlayCircle className="h-5 w-5 text-emerald-400" />
                <span>Lista de Partidas & Placar da Mesa</span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecione qualquer partida para abrir o Placar Digital ao Vivo dos árbitros
              </p>
            </div>
          </div>

          {tournament.matches && tournament.matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournament.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              <span>Atletas e Duplas Inscritos ({participantsCount})</span>
            </h3>

            <Link
              href={`/torneios/${tournamentId}/inscricao`}
              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
            >
              + Nova Inscrição
            </Link>
          </div>

          {tournament.participants && tournament.participants.length > 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Nome do Jogador / Dupla</th>
                      <th className="py-3 px-4">Parceiro</th>
                      <th className="py-3 px-4">Contato</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tournament.participants.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {p.partnerName || "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                          {p.phone || p.email || "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                            Confirmado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
              <p className="text-sm text-slate-500">
                Nenhum participante inscrito ainda.
              </p>
              <Link
                href={`/torneios/${tournamentId}/inscricao`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                <span>Inscrever Primeiro Participante</span>
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
    </div>
  );
}
