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
import { formatDateShort, cn } from "@/lib/utils";
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
      <section className="relative overflow-hidden border-b border-collegiate-border/80 bg-gradient-to-b from-collegiate-dark via-collegiate-surface/50 to-collegiate-dark px-4 py-16 sm:px-6 lg:px-8 arena-grid-pattern">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-80 w-3/4 max-w-4xl bg-amber-500/15 blur-[130px] pointer-events-none -z-10 rounded-full" />

        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-950/60 px-4 py-1.5 text-xs sm:text-sm font-black text-amber-300 backdrop-blur shadow-md">
            <MapPin className="h-4 w-4 text-amber-400" />
            <span>Circuito Comunitário &bull; Olinda / Pernambuco</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            Plataforma Oficial{" "}
            <span className="text-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]">
              MesaMatch
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal">
            Gestão profissional de campeonatos de Futmesa para comunidades e ligas universitárias. Inscrições com 1 toque, chaveamento automático de mata-mata e mesa de arbitragem digital ao vivo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/torneios/novo"
              className="flex items-center gap-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 px-7 py-4 text-sm sm:text-base font-black text-collegiate-dark shadow-xl shadow-amber-900/40 active:scale-95 transition-all border border-amber-300 hover:shadow-amber-500/20"
            >
              <PlusCircle className="h-5 w-5 stroke-[2.5]" />
              <span>Criar Campeonato em Olinda</span>
            </Link>

            <a
              href="#torneios-section"
              className="flex items-center gap-2 rounded-2xl border border-collegiate-border bg-collegiate-surface/90 px-6 py-4 text-sm sm:text-base font-bold text-amber-300 hover:bg-collegiate-surfaceHover hover:border-amber-400/50 transition-all shadow-md"
            >
              <Trophy className="h-5 w-5 text-amber-400" />
              <span>Ver Campeonatos</span>
            </a>
          </div>

          {/* Quick neighborhood tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs font-semibold text-emerald-200/70">
            <span className="text-amber-400 font-black uppercase tracking-wider">Pólos:</span>
            {["Rio Doce", "Peixinhos", "Bultrins", "Alto da Sé", "Sítio Novo", "Jardim Brasil", "Amaro Branco", "Ouro Preto", "Casa Caiada"].map((b) => (
              <span key={b} className="rounded-lg bg-collegiate-surface/80 border border-collegiate-border/80 px-2.5 py-1 hover:border-amber-400/40 transition-colors">
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
              <p className="text-sm text-slate-400 max-w-md">
                Comece criando o primeiro campeonato de MesaMatch do seu projeto de extensão universitária ou comunidade.
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
                  className={cn(
                    "group relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 shadow-xl",
                    isLive
                      ? "border-2 border-amber-400/80 bg-gradient-to-b from-amber-950/20 via-collegiate-surface to-collegiate-dark shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                      : "glass-panel glass-panel-hover border-collegiate-border"
                  )}
                >
                  <div className="space-y-4">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="rounded-lg bg-collegiate-dark/90 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30 shadow-inner">
                          {isDuplas ? "2x2 Duplas" : "1x1 Individual"}
                        </span>
                        {torneio.community && (
                          <span className="rounded-lg bg-emerald-950/90 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/40">
                            {torneio.community}
                          </span>
                        )}
                      </div>

                      <div>
                        {isOpen && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/40">
                            Inscrições Abertas
                          </span>
                        )}
                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-300 border-2 border-amber-400 animate-pulse-tension">
                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                            Ao Vivo
                          </span>
                        )}
                        {isFinished && (
                          <span className="inline-flex items-center rounded-full bg-collegiate-dark/90 px-3 py-1 text-xs font-bold text-slate-400 border border-collegiate-border">
                            Finalizado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1 tracking-tight">
                        {torneio.title}
                      </h3>
                      {torneio.description && (
                        <p className="text-xs sm:text-sm text-emerald-100/75 line-clamp-2 mt-1.5 leading-relaxed font-normal">
                          {torneio.description}
                        </p>
                      )}
                    </div>

                    {/* Sponsors badge if exists */}
                    {torneio.sponsors && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-300/90 bg-amber-950/40 rounded-xl px-3 py-1.5 border border-amber-500/30">
                        <Store className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">Apoio: {torneio.sponsors}</span>
                      </div>
                    )}

                    {/* Meta info: Format, Rules, Location, Date */}
                    <div className="space-y-2 pt-3 border-t border-collegiate-border/70 text-xs font-medium text-emerald-200/80">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
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
                          <MapPin className="h-4 w-4 text-amber-400/90 shrink-0" />
                          <span className="truncate text-slate-200">{torneio.location}</span>
                        </div>
                      )}

                      {torneio.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-400/90 shrink-0" />
                          <span className="text-slate-200">{formatDateShort(torneio.startDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer with counts and link button */}
                  <div className="mt-6 pt-3.5 border-t border-collegiate-border/70 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-emerald-200/90 font-bold">
                      <span>👥 {torneio._count.participants} atletas</span>
                      <span>⚔️ {torneio._count.matches} jogos</span>
                    </div>

                    <Link
                      href={`/torneios/${torneio.id}`}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs font-black text-collegiate-dark transition-all shadow-md shadow-amber-900/30 group-hover:scale-105 active:scale-95"
                    >
                      <span>Acessar</span>
                      <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
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
