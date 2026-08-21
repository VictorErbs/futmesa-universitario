"use client";

import React from "react";
import { GroupStanding, GroupType } from "@/types/tournament";
import { calculateGroupStandings } from "@/lib/tournament-engine";
import { Trophy, CheckCircle2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupTableProps {
  group: GroupType;
  pointsPerSet?: number;
}

export const GroupTable: React.FC<GroupTableProps> = ({
  group,
  pointsPerSet = 18,
}) => {
  const standings = calculateGroupStandings(
    group.participants || [],
    group.matches || [],
    pointsPerSet
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
          <h3 className="font-bold text-white text-base tracking-wide">
            {group.name}
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {group.participants?.length || 0} participantes
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th scope="col" className="py-2.5 px-3 w-12 text-center">#</th>
              <th scope="col" className="py-2.5 px-3">Atleta / Dupla</th>
              <th scope="col" className="py-2.5 px-2 text-center" title="Jogos disputados">J</th>
              <th scope="col" className="py-2.5 px-2 text-center text-emerald-400" title="Vitórias">V</th>
              <th scope="col" className="py-2.5 px-2 text-center text-red-400" title="Derrotas">D</th>
              <th scope="col" className="py-2.5 px-2 text-center hidden sm:table-cell" title="Sets Pró / Contra">Sets</th>
              <th scope="col" className="py-2.5 px-2 text-center" title="Saldo de Sets">SD</th>
              <th scope="col" className="py-2.5 px-2 text-center hidden md:table-cell" title="Saldo de Pontos">Saldo Pt</th>
              <th scope="col" className="py-2.5 px-3 text-center font-black text-amber-400">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {standings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-500">
                  Nenhum participante neste grupo ainda.
                </td>
              </tr>
            ) : (
              standings.map((row, index) => {
                const isTop2 = index < 2;
                return (
                  <tr
                    key={row.participantId}
                    className={cn(
                      "transition-colors",
                      isTop2 ? "bg-emerald-950/20 hover:bg-emerald-950/30" : "hover:bg-slate-800/40"
                    )}
                  >
                    {/* Position */}
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <div className="flex items-center justify-center">
                        {isTop2 ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs">
                            {index + 1}
                          </span>
                        ) : (
                          <span className="text-slate-500">{index + 1}</span>
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                          <span>{row.name}</span>
                          {isTop2 && (
                            <span className="inline-block text-[10px] rounded bg-emerald-500/20 px-1 py-0.2 text-emerald-400 border border-emerald-500/30">
                              G2
                            </span>
                          )}
                        </div>
                        {row.partnerName && (
                          <span className="text-xs text-slate-400">
                            & {row.partnerName}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-3 px-2 text-center font-mono text-slate-300">
                      {row.played}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-semibold text-emerald-400">
                      {row.won}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-slate-400">
                      {row.lost}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">
                      {row.setsWon}-{row.setsLost}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-bold">
                      <span
                        className={
                          row.setDiff > 0
                            ? "text-emerald-400"
                            : row.setDiff < 0
                            ? "text-red-400"
                            : "text-slate-400"
                        }
                      >
                        {row.setDiff > 0 ? `+${row.setDiff}` : row.setDiff}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-xs hidden md:table-cell">
                      <span
                        className={
                          row.pointDiff > 0
                            ? "text-emerald-400"
                            : row.pointDiff < 0
                            ? "text-red-400"
                            : "text-slate-400"
                        }
                      >
                        {row.pointDiff > 0 ? `+${row.pointDiff}` : row.pointDiff}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-amber-400 text-sm">
                      {row.points}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Legend */}
      <div className="flex items-center gap-2 border-t border-slate-800 bg-slate-950/40 px-4 py-2 text-[11px] text-slate-400">
        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
        <span>Zona de classificação (Avançam os 2 melhores de cada grupo)</span>
      </div>
    </div>
  );
};
