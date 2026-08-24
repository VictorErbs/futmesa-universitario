import React from "react";
import Link from "next/link";
import prisma from "@/lib/db";
import {
  Trophy,
  Users,
  Swords,
  PlusCircle,
  Calendar,
  MapPin,
  Flame,
  ArrowRight,
  ShieldCheck,
  Store,
} from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { BAIRROS_OLINDA } from "@/lib/olinda";

// Server Component with dynamic data loading
export const revalidate = 0;

export default async function HomePage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          participants: true,
          matches: true,
        },
      },
    },
  });

  const totalParticipants = await prisma.participant.count();
  const totalMatches = await prisma.match.count();
  const activeTournamentsCount = tournaments.filter(
    (t) =>
      t.status === "EM_ANDAMENTO" ||
      t.status === "INSCRICOES_ABERTAS" ||
      t.status === "IN_PROGRESS" ||
      t.status === "REGISTRATION"
  ).length;

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Hero Banner with Olinda Community focus */}
      <section className="relative overflow-hidden border-b border-collegiate-border/80 bg-gradient-to-b from-collegiate-dark via-collegiate-surface/40 to-collegiate-dark px-4 py-16 sm:px-6 lg:px-8">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-72 w-3/4 max-w-4xl bg-amber-500/10 blur-[120px] pointer-events-none -z-10 rounded-full" />

        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/40 px-4 py-1.5 text-xs sm:text-sm font-bold text-amber-300 backdrop-blur shadow-sm">
            <MapPin className="h-4 w-4 text-amber-400" />
            <span>Circuito Comunitário de Futmesa • Olinda / Pernambuco</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Futmesa Comunitário{" "}
            <span className="text-amber-400">
              Olinda
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-emerald-100/80 leading-relaxed font-normal">
            Gestão de campeonatos de futmesa para as praças, orlas e quebradas de Olinda/PE. Inscrições rápidas pelo WhatsApp, chaveamento mata-mata clássico e placar digital na beira da mesa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/torneios/novo"
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-3.5 text-sm sm:text-base font-bold text-collegiate-dark shadow-xl shadow-amber-900/30 active:scale-95 transition-all border border-amber-400"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Criar Campeonato em Olinda</span>
            </Link>

            <a
              href="#torneios-section"
              className="flex items-center gap-2 rounded-xl border border-collegiate-border bg-collegiate-surface/80 px-6 py-3.5 text-sm sm:text-base font-bold text-amber-300 hover:bg-collegiate-surface hover:border-amber-500/40 transition-all shadow-md"
            >
              <Trophy className="h-5 w-5 text-amber-400" />
              <span>Ver Campeonatos</span>
            </a>
          </div>

          {/* Quick neighborhood tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4 text-[11px] font-medium text-emerald-200/60">
            <span className="text-amber-400/80 font-bold">Pólos:</span>
            {["Rio Doce", "Peixinhos", "Bultrins", "Alto da Sé", "Sítio Novo", "Jardim Brasil", "Amaro Branco", "Ouro Preto", "Casa Caiada"].map((b) => (
              <span key={b} className="rounded bg-collegiate-surface/60 border border-collegiate-border/60 px-2 py-0.5">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-collegiate-border bg-collegiate-surface/90 p-5 shadow-lg backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {activeTournamentsCount}
              </div>
              <div className="text-xs font-bold text-emerald-300/70 uppercase tracking-wider">
                Campeonatos Ativos / Abertos
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-collegiate-border bg-collegiate-surface/90 p-5 shadow-lg backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {totalParticipants}
              </div>
              <div className="text-xs font-bold text-emerald-300/70 uppercase tracking-wider">
                Atletas / Duplas Inscritos
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-collegiate-border bg-collegiate-surface/90 p-5 shadow-lg backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Swords className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {totalMatches}
              </div>
              <div className="text-xs font-bold text-emerald-300/70 uppercase tracking-wider">
                Partidas Geradas
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tournaments Grid Section */}
      <section id="torneios-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-collegiate-border pb-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Flame className="h-6 w-6 text-amber-400" />
              <span>Campeonatos nas Praças e Orlas</span>
            </h2>
            <p className="text-sm text-emerald-100/70">
              Acompanhe as chaves ao vivo, convoque atletas ou inscreva sua dupla pelo WhatsApp
            </p>
          </div>

          <Link
            href="/torneios/novo"
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs sm:text-sm font-bold text-collegiate-dark transition-all self-start sm:self-auto shadow"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Campeonato</span>
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-collegiate-border bg-collegiate-surface/40 p-12 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-collegiate-surface text-amber-400 border border-collegiate-border">
              <Trophy className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                Nenhum campeonato cadastrado ainda
              </h3>
              <p className="text-sm text-emerald-100/70 max-w-md">
                Comece criando o primeiro campeonato de Futmesa da sua comunidade ou praça em Olinda/PE.
              </p>
            </div>
            <Link
              href="/torneios/novo"
              className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-collegiate-dark hover:bg-amber-400 transition-all shadow-md"
            >
              Criar Primeiro Campeonato
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((torneio) => {
              const isOpen =
                torneio.status === "INSCRICOES_ABERTAS" ||
                torneio.status === "REGISTRATION";
              const isLive =
                torneio.status === "EM_ANDAMENTO" ||
                torneio.status === "IN_PROGRESS";
              const isFinished =
                torneio.status === "FINALIZADO" ||
                torneio.status === "FINISHED";

              const isDuplas =
                torneio.modality === "DUPLAS" ||
                torneio.modality === "DOUBLES" ||
                torneio.modality === "2x2";

              const isGroups =
                torneio.format === "GRUPOS_E_MATA_MATA" ||
                torneio.format === "GROUPS_AND_KNOCKOUT";

              return (
                <div
                  key={torneio.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-collegiate-border bg-collegiate-surface/90 p-5 shadow-lg hover:border-amber-500/50 hover:shadow-amber-500/10 transition-all duration-200"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md bg-collegiate-dark/80 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-300 border border-collegiate-border">
                          {isDuplas ? "2x2 Duplas" : "1x1 Individual"}
                        </span>
                        {torneio.community && (
                          <span className="rounded-md bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                            {torneio.community}
                          </span>
                        )}
                      </div>

                      <div>
                        {isOpen && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                            Inscrições Abertas
                          </span>
                        )}
                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30 animate-pulse-live">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                            Ao Vivo
                          </span>
                        )}
                        {isFinished && (
                          <span className="inline-flex items-center rounded-full bg-collegiate-dark px-2.5 py-0.5 text-xs font-semibold text-slate-400 border border-collegiate-border">
                            Finalizado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {torneio.title}
                      </h3>
                      {torneio.description && (
                        <p className="text-xs text-emerald-100/70 line-clamp-2 mt-1">
                          {torneio.description}
                        </p>
                      )}
                    </div>

                    {/* Sponsors badge if exists */}
                    {torneio.sponsors && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80 bg-amber-950/30 rounded-lg px-2.5 py-1 border border-amber-500/20">
                        <Store className="h-3 w-3 text-amber-400 shrink-0" />
                        <span className="truncate">Apoio: {torneio.sponsors}</span>
                      </div>
                    )}

                    {/* Meta info: Format, Rules, Location, Date */}
                    <div className="space-y-1.5 pt-2 border-t border-collegiate-border/80 text-xs text-emerald-200/70">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>
                          {isGroups
                            ? "Grupos + Mata-Mata"
                            : "Mata-Mata Eliminatório"}
                          {" • "}
                          {torneio.pointsPerSet} pts / set
                        </span>
                      </div>

                      {torneio.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
                          <span className="truncate text-slate-300">{torneio.location}</span>
                        </div>
                      )}

                      {torneio.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
                          <span className="text-slate-300">{formatDateShort(torneio.startDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer with counts and link button */}
                  <div className="mt-5 pt-3 border-t border-collegiate-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-emerald-200/80 font-medium">
                      <span>👥 {torneio._count.participants} inscritos</span>
                      <span>⚔️ {torneio._count.matches} jogos</span>
                    </div>

                    <Link
                      href={`/torneios/${torneio.id}`}
                      className="flex items-center gap-1 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-collegiate-dark hover:bg-amber-400 transition-colors shadow-sm"
                    >
                      <span>Acessar</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
