import React from "react";
import { Users, Search } from "lucide-react";
import Link from "next/link";
import { ParticipantType } from "@/types/tournament";

interface ParticipantsTabProps {
  participants: ParticipantType[];
  participantsCount: number;
  tournamentId: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  selectedBairro?: string;
  onBairroChange?: (value: string) => void;
  availableBairros?: string[];
}

export const ParticipantsTab: React.FC<ParticipantsTabProps> = ({
  participants,
  participantsCount,
  tournamentId,
  searchQuery = "",
  onSearchChange,
  selectedBairro = "TODOS",
  onBairroChange,
  availableBairros = [],
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      {participantsCount > 0 && (onSearchChange || onBairroChange) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {onSearchChange && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nome, apelido, parceiro ou projeto..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          )}
          {onBairroChange && availableBairros.length > 0 && (
            <select
              value={selectedBairro}
              onChange={(e) => onBairroChange(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="TODOS">Todos os bairros</option>
              {availableBairros.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {participants && participants.length > 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Nome do Jogador / Dupla</th>
                  <th className="py-3 px-4">Apelido (Vulgo)</th>
                  <th className="py-3 px-4">Bairro / Comunidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {participants.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      <div>{p.name}</div>
                      {p.partnerName && (
                        <div className="text-xs font-normal text-emerald-300/80">
                          &amp; {p.partnerName}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div>{p.nickname || "-"}</div>
                      {p.partnerNickname && (
                        <div className="text-xs text-slate-500">
                          &amp; {p.partnerNickname}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {p.neighborhood || p.communityOrProject || "-"}
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
            {participantsCount > 0
              ? "Nenhum participante encontrado com os filtros atuais."
              : "Nenhum participante inscrito ainda."}
          </p>
          {participantsCount === 0 && (
            <Link
              href={`/torneios/${tournamentId}/inscricao`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
            >
              <span>Inscrever Primeiro Participante</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
