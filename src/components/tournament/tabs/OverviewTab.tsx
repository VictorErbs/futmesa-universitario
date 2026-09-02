import React from "react";
import { Trophy, Users, Copy, MessageCircle } from "lucide-react";
import { TournamentType } from "@/types/tournament";

interface OverviewTabProps {
  tournament: TournamentType;
  isDuplas: boolean;
  isGroups: boolean;
  maxSetsCount: number;
  setsToWinCount: number;
  participantsCount: number;
  matchesCount: number;
  copiedLink: boolean;
  onCopyRegistrationLink: () => void;
  onShareWhatsApp: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  tournament,
  isDuplas,
  isGroups,
  maxSetsCount,
  setsToWinCount,
  participantsCount,
  matchesCount,
  copiedLink,
  onCopyRegistrationLink,
  onShareWhatsApp,
}) => {
  return (
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
          <h3 className="text-base font-black text-amber-300">Regras Oficiais do MesaMatch Aplicadas</h3>
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
              onClick={onCopyRegistrationLink}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs sm:text-sm font-bold text-collegiate-dark shadow-lg shadow-amber-950/40 hover:bg-amber-400 transition-all border border-amber-400"
            >
              <Copy className="h-4 w-4" />
              <span>{copiedLink ? "Link Copiado com Sucesso!" : "Copiar Link de Inscrição"}</span>
            </button>

            <button
              onClick={onShareWhatsApp}
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
  );
};
