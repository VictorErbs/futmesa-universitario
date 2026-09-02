import React from "react";
import { Layers } from "lucide-react";
import { GroupTable } from "@/components/tournament/GroupTable";
import { GroupType } from "@/types/tournament"; // Assuming this type exists or can be any if not

interface GroupsTabProps {
  groups: any[]; // Using any[] for now as it wasn't clearly typed in the main file
  pointsPerSet: number;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({ groups, pointsPerSet }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-emerald-400" />
          <span>Classificação dos Grupos</span>
        </h3>
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
