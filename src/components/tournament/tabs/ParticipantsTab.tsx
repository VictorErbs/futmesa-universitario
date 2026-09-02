import React from "react";
import { Users } from "lucide-react";
import Link from "next/link";
import { ParticipantType } from "@/types/tournament"; // Assuming this type exists

interface ParticipantsTabProps {
  participants: any[]; // Using any[] for now, will map to the original array type
  participantsCount: number;
  tournamentId: string;
}

export const ParticipantsTab: React.FC<ParticipantsTabProps> = ({
  participants,
  participantsCount,
  tournamentId,
}) => {
  return (
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

      {participants && participants.length > 0 ? (
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
                {participants.map((p, idx) => (
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
  );
};
