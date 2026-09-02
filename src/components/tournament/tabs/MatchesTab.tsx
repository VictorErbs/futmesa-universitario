import React from "react";
import { PlayCircle } from "lucide-react";
import { MatchCard } from "@/components/tournament/MatchCard";
import { MatchType } from "@/types/tournament";

interface MatchesTabProps {
  matches: MatchType[];
  onOpenScoreboard: (match: MatchType) => void;
}

export const MatchesTab: React.FC<MatchesTabProps> = ({
  matches,
  onOpenScoreboard,
}) => {
  return (
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

      {matches && matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onOpenScoreboard={onOpenScoreboard}
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
  );
};
