import React from "react";
import { Layers, Swords } from "lucide-react";
import { GroupTable } from "@/components/tournament/GroupTable";
import { GroupType } from "@/types/tournament";

interface GroupsTabProps {
  groups: GroupType[];
  pointsPerSet: number;
  isAdmin?: boolean;
  hasKnockoutMatches?: boolean;
  isGeneratingPlayoffs?: boolean;
  onGeneratePlayoffs?: () => void;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({
  groups,
  pointsPerSet,
  isAdmin = false,
  hasKnockoutMatches = false,
  isGeneratingPlayoffs = false,
  onGeneratePlayoffs,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-emerald-400" />
          <span>Classificação dos Grupos</span>
        </h3>

        {isAdmin && groups && groups.length > 0 && onGeneratePlayoffs && (
          <button
            type="button"
            onClick={onGeneratePlayoffs}
            disabled={isGeneratingPlayoffs}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-black text-collegiate-dark shadow-md transition-all disabled:opacity-50"
          >
            <Swords className="h-4 w-4" />
            <span>
              {isGeneratingPlayoffs
                ? "Gerando Mata-Mata..."
                : hasKnockoutMatches
                ? "Re-gerar Mata-Mata dos Classificados"
                : "Gerar Mata-Mata dos Classificados"}
            </span>
          </button>
        )}
      </div>

      {groups && groups.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groups.map((group) => (
            <GroupTable
              key={group.id}
              group={group}
              pointsPerSet={pointsPerSet}
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
  );
};
