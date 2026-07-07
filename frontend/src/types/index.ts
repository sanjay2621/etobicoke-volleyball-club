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

export type PlayerLookupResponse = {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phone: string;
  email: string;
  address?: AddressDto | null;
  preferredPositions: Position[];
  tshirtSize: TshirtSize;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  skillLevel?: SkillLevel | null;
  photoConsent: boolean;
  hasPhoto: boolean;
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
  tshirtColor?: string | null;
  members: TeamMemberView[];
};

export type TshirtColor = { label: string; hex: string };

export const TSHIRT_COLORS: TshirtColor[] = [
  { label: 'White',                    hex: '#FFFFFF' },
  { label: 'Off White',                hex: '#F5F5F0' },
  { label: 'Natural',                  hex: '#F5F0E8' },
  { label: 'Cornsilk',                 hex: '#FFF8DC' },
  { label: 'Ice Grey',                 hex: '#D8D8D8' },
  { label: 'Sport Grey',               hex: '#8C8C8C' },
  { label: 'Graphite Heather',         hex: '#555555' },
  { label: 'Dark Heather',             hex: '#484848' },
  { label: 'Heather Dark Grey',        hex: '#606060' },
  { label: 'Charcoal',                 hex: '#36454F' },
  { label: 'Black',                    hex: '#1A1A1A' },
  { label: 'Navy',                     hex: '#1F305E' },
  { label: 'Heather Navy',             hex: '#2A3A6A' },
  { label: 'Antique Sapphire',         hex: '#4A5E7A' },
  { label: 'Sapphire',                 hex: '#0F4D92' },
  { label: 'Heather Sapphire',         hex: '#3A5A9A' },
  { label: 'Indigo Blue',              hex: '#4B0082' },
  { label: 'Heather Indigo',           hex: '#4B5698' },
  { label: 'Iris',                     hex: '#5A4FCF' },
  { label: 'Royal',                    hex: '#4169E1' },
  { label: 'Heather Royal',            hex: '#4060CC' },
  { label: 'Metro Blue',               hex: '#3E6EAA' },
  { label: 'Stone Blue',               hex: '#7BA4C7' },
  { label: 'Paragon',                  hex: '#6B8E9F' },
  { label: 'Carolina Blue',            hex: '#56A0D3' },
  { label: 'Heather Galapagos Blue',   hex: '#3A7A9A' },
  { label: 'Tropical Blue',            hex: '#0099CC' },
  { label: 'Sky',                      hex: '#7EC8E3' },
  { label: 'Light Blue',               hex: '#ADD8E6' },
  { label: 'Irish Green',              hex: '#009A44' },
  { label: 'Heather Irish Green',      hex: '#5A9A5A' },
  { label: 'Forest',                   hex: '#228B22' },
  { label: 'Kelly Green',              hex: '#4CBB17' },
  { label: 'Jade Dome',                hex: '#2E8B57' },
  { label: 'Military Green',           hex: '#4B5320' },
  { label: 'Heather Military Green',   hex: '#6A7A50' },
  { label: 'Sage',                     hex: '#8FAF8F' },
  { label: 'Mint Green',               hex: '#98FF98' },
  { label: 'Pistachio',                hex: '#93C572' },
  { label: 'Kiwi',                     hex: '#8EE53F' },
  { label: 'Lime',                     hex: '#32CD32' },
  { label: 'Purple',                   hex: '#6A0DAD' },
  { label: 'Heather Purple',           hex: '#8A5AAA' },
  { label: 'Heather Radiant Orchid',   hex: '#B05AAA' },
  { label: 'Maroon',                   hex: '#800000' },
  { label: 'Heather Maroon',           hex: '#8A4055' },
  { label: 'Cardinal Red',             hex: '#8C1515' },
  { label: 'Heather Cardinal Red',     hex: '#9B3040' },
  { label: 'Antique Cherry Red',       hex: '#8B2635' },
  { label: 'Red',                      hex: '#CC0000' },
  { label: 'Heather Red',              hex: '#CC4444' },
  { label: 'Cherry Red',               hex: '#DE3163' },
  { label: 'Orange',                   hex: '#FF6600' },
  { label: 'Heather Orange',           hex: '#E07A45' },
  { label: 'Gold',                     hex: '#C8960C' },
  { label: 'Daisy',                    hex: '#FFD700' },
  { label: 'Sand',                     hex: '#C2B280' },
  { label: 'Dark Chocolate',           hex: '#3D1C0A' },
  { label: 'Heliconia',                hex: '#E0115F' },
  { label: 'Antique Heliconia',        hex: '#A85070' },
  { label: 'Heather Heliconia',        hex: '#D0507A' },
  { label: 'Heather Berry',            hex: '#CC4477' },
  { label: 'Azalea',                   hex: '#EF5B9C' },
  { label: 'Light Pink',               hex: '#FFB6C1' },
  { label: 'Coral Silk',               hex: '#F08080' },
];

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
  paymentStatus: PaymentStatus;
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
