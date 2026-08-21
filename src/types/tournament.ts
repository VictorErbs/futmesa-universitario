export type TournamentStatus =
  | "REGISTRATION"
  | "IN_PROGRESS"
  | "FINISHED"
  | "CANCELLED"
  | "INSCRICOES_ABERTAS"
  | "EM_ANDAMENTO"
  | "FINALIZADO"
  | "CANCELADO";

export type Modality = "INDIVIDUAL" | "DOUBLES" | "DUPLAS" | "1x1" | "2x2";
export type TournamentFormat =
  | "SINGLE_ELIMINATION"
  | "GROUPS_AND_KNOCKOUT"
  | "MATA_MATA"
  | "GRUPOS_E_MATA_MATA";

export type MatchStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "FINISHED"
  | "BYE"
  | "AGENDADA"
  | "AO_VIVO"
  | "FINALIZADA";

export interface ParticipantType {
  id: string;
  name: string;
  partnerName?: string | null;
  phone?: string | null;
  email?: string | null;
  seed?: number | null;
  status: string;
  tournamentId: string;
  groupId?: string | null;
  groupName?: string | null;
  createdAt: Date | string;
}

export interface MatchSetType {
  id?: string;
  matchId?: string;
  setNumber: number;
  score1: number;
  score2: number;
  winnerId?: string | null;
  isFinished: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface MatchType {
  id: string;
  tournamentId?: string;
  stage?: string;
  groupId?: string | null;
  groupName?: string | null;
  round: number;
  roundName?: string | null;
  matchNumber?: number | null;
  participant1Id?: string | null;
  participant1?: ParticipantType | null;
  participant2Id?: string | null;
  participant2?: ParticipantType | null;
  winnerId?: string | null;
  winner?: ParticipantType | null;
  nextMatchId?: string | null;
  nextMatchSlot?: number | null;
  status: MatchStatus;
  court?: string | null;
  scheduledTime?: Date | string | null;
  sets: MatchSetType[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface GroupType {
  id: string;
  name: string;
  tournamentId?: string;
  participants: ParticipantType[];
  matches: MatchType[];
  createdAt?: Date | string;
}

export interface TournamentType {
  id: string;
  title: string;
  description?: string | null;
  modality: Modality;
  format: TournamentFormat;
  pointsPerSet: number;
  setsToWin?: number;
  maxSets?: number;
  advantageRule?: boolean;
  location?: string | null;
  startDate?: Date | string | null;
  status: TournamentStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  participants?: ParticipantType[];
  groups?: GroupType[];
  matches?: MatchType[];
  _count?: {
    participants?: number;
    matches?: number;
  };
}

export interface GroupStanding {
  participantId: string;
  name: string;
  partnerName?: string | null;
  played: number;
  won: number;
  lost: number;
  setsWon: number;
  setsLost: number;
  setDiff: number;
  pointsWon: number;
  pointsLost: number;
  pointDiff: number;
  points: number; // 3 pts por vitória
  isQualified?: boolean;
}
