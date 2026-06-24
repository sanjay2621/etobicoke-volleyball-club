export type Role = 'ADMIN' | 'PLAYER';

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: Role;
  playerId: number | null;
};

export type TournamentStatus =
  | 'SETUP'
  | 'REGISTRATION'
  | 'DRAFT'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETE';

export type Tournament = {
  id: number;
  name: string;
  date: string; // ISO yyyy-MM-dd
  startTime: string; // HH:mm:ss
  venue?: string | null;
  numberOfCourts: number;
  breakMinutes: number;
  poolMatchDurationMinutes: number;
  poolSetsToWin: number;
  poolPointsPerSet: number;
  finalSetsToWin: number;
  finalPointsPerSet: number;
  targetRosterSize: number;
  captainCountsInRoster: boolean;
  draftRounds: number;
  registrationOpen: boolean;
  registrationDeadline?: string | null;
  status: TournamentStatus;
};

export type Position = 'CENTER' | 'NETTY' | 'FRONT' | 'BACK' | 'ANYWHERE' | 'REFEREE';
export const POSITIONS: Position[] = ['CENTER', 'NETTY', 'FRONT', 'BACK', 'ANYWHERE', 'REFEREE'];

export type TshirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
export const TSHIRT_SIZES: TshirtSize[] = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export const SKILL_LEVELS: SkillLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export type PaymentStatus = 'UNPAID' | 'PAID';

export type AddressDto = {
  line1?: string;
  line2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
};

export type Player = {
  id: number;
  tournamentId: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  photoUrl?: string | null;
  address?: AddressDto | null;
  preferredPositions: Position[];
  tshirtSize: TshirtSize;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  skillLevel?: SkillLevel | null;
  yearsExperience?: number | null;
  jerseyNumberPreference?: number | null;
  waiverAccepted: boolean;
  photoConsent: boolean;
  dietaryNotes?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  paymentStatus: PaymentStatus;
  notes?: string | null;
  manualEntry: boolean;
  hasAccount: boolean;
};

export type PlayerRegistrationRequest = {
  tournamentId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone: string;
  email: string;
  address?: AddressDto;
  preferredPositions: Position[];
  tshirtSize: TshirtSize;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  skillLevel?: SkillLevel;
  yearsExperience?: number;
  jerseyNumberPreference?: number;
  waiverAccepted: boolean;
  photoConsent: boolean;
  dietaryNotes?: string;
  gender?: string;
  dateOfBirth?: string;
  notes?: string;
};

export type TeamMemberView = {
  playerId: number;
  fullName: string;
  photoUrl?: string | null;
  preferredPositions: Position[];
  captain: boolean;
  referee: boolean;
  draftRound?: number | null;
};

export type Team = {
  id: number;
  tournamentId: number;
  name: string;
  captainPlayerId?: number | null;
  refereePlayerId?: number | null;
  groupLabel?: string | null;
  seed: number;
  memberCount: number;
  members: TeamMemberView[];
};

export type PublicTeamMember = {
  playerId: number;
  fullName: string;
  photoUrl?: string | null;
  captain: boolean;
};

export type PublicTeam = {
  id: number;
  name: string;
  groupLabel?: string | null;
  seed: number;
  refereeName?: string | null;
  members: PublicTeamMember[];
};

export type CaptainRosterMember = {
  playerId: number;
  fullName: string;
  photoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  skillLevel?: SkillLevel | null;
  preferredPositions: Position[];
  captain: boolean;
};

export type CaptainRoster = {
  teamId: number;
  name: string;
  groupLabel?: string | null;
  members: CaptainRosterMember[];
};

export type TeamRequest = {
  tournamentId: number;
  name: string;
  captainPlayerId?: number | null;
  refereePlayerId?: number | null;
  groupLabel?: string | null;
  seed?: number;
};

export type MatchSetDto = { setNumber: number; homePoints: number; awayPoints: number };

export type MatchResponse = {
  id: number;
  stage: 'POOL' | 'SEMIFINAL' | 'BRONZE' | 'FINAL';
  groupLabel?: string | null;
  roundNumber?: number | null;
  court?: number | null;
  scheduledStart?: string | null;
  homeTeamId?: number | null;
  homeTeamName?: string | null;
  awayTeamId?: number | null;
  awayTeamName?: string | null;
  bracketSlot?: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETE';
  winnerTeamId?: number | null;
  sets: MatchSetDto[];
};

export type StandingRow = {
  rank: number;
  teamId: number;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
};

export type StandingGroup = { groupLabel: string; rows: StandingRow[] };

export type DraftState = {
  tournamentId: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';
  currentRound: number;
  totalRounds: number;
  onTheClockTeamId?: number | null;
  onTheClockTeamName?: string | null;
  teams: Team[];
  availablePlayers: Player[];
};

export type TournamentRequest = {
  name: string;
  date: string;
  startTime: string;
  venue?: string;
  numberOfCourts?: number;
  breakMinutes?: number;
  poolMatchDurationMinutes?: number;
  poolSetsToWin?: number;
  poolPointsPerSet?: number;
  finalSetsToWin?: number;
  finalPointsPerSet?: number;
  targetRosterSize?: number;
  captainCountsInRoster?: boolean;
  registrationOpen?: boolean;
  registrationDeadline?: string | null;
  status?: TournamentStatus;
};
