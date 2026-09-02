import React from "react";
import { Swords } from "lucide-react";
import { MatchType } from "@/types/tournament";
import { BracketTree } from "@/components/tournament/BracketTree";

interface BracketTabProps {
  matches: MatchType[];
  onOpenScoreboard: (match: MatchType) => void;
}

export const BracketTab: React.FC<BracketTabProps> = ({
  matches,
  onOpenScoreboard,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Swords className="h-5 w-5 text-emerald-400" />
          <span>Chaveamento Eliminatório</span>
        </h3>
      </div>

      <BracketTree
        matches={matches}
        onOpenScoreboard={onOpenScoreboard}
      />
    </div>
  );
};
