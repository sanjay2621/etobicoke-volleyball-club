import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import SportsIcon from '@mui/icons-material/Sports';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import StarIcon from '@mui/icons-material/Star';
import { useActivePublicTournaments } from '../../api/tournaments';
import { usePublicTeams } from '../../api/teams';
import { usePublicSchedule, usePublicStandings } from '../../api/schedule';
import type { MatchResponse, PublicTeam, StandingGroup, Tournament } from '../../types';
import styles from './HomePage.module.css';

export function HomePage() {
  const { data: tournaments } = useActivePublicTournaments();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tab, setTab] = useState(0);

  // Default to the newest tournament (latest date) once the list loads.
  const sorted = useMemo(
    () => [...(tournaments ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [tournaments],
  );
  const tournamentId = selectedId ?? sorted[0]?.id ?? null;
  const featured: Tournament | undefined = sorted.find((t) => t.id === tournamentId) ?? sorted[0];

  return (
    <Box className={styles.root}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <SportsVolleyballIcon className={styles.appBarIcon} />
          <Typography variant="h6" className={styles.appBarTitle}>
            Etobicoke Volleyball Club
          </Typography>
          <Button color="inherit" component={RouterLink} to="/login">
            Log in
          </Button>
        </Toolbar>
      </AppBar>

      <Box className={styles.hero}>
        {/* Decorative volleyball shapes */}
        <SportsVolleyballIcon className={styles.heroDecor1} />
        <SportsVolleyballIcon className={styles.heroDecor2} />
        <SportsVolleyballIcon className={styles.heroDecor3} />

        <Container maxWidth="md" className={styles.heroContainer}>
          <Box className={styles.heroPill}>
            <SportsVolleyballIcon className={styles.heroPillIcon} />
            <Typography variant="caption" fontWeight={600} letterSpacing={1} className={styles.heroPillText}>
              Etobicoke Volleyball Club
            </Typography>
          </Box>

          <Typography variant="h2" fontWeight={900} letterSpacing={-1} className={styles.heroHeading}>
            Game on.{' '}
            <Box component="span" className={styles.heroAccent}>
              Register
            </Box>{' '}
            your spot.
          </Typography>

          <Typography variant="h6" className={featured?.registrationDeadline ? styles.heroSubtextWithDeadline : styles.heroSubtext}>
            {featured
              ? `${featured.name} — ${new Date(featured.date).toLocaleDateString()} at ${featured.startTime?.slice(0, 5)}`
              : 'Sign up, get drafted, and hit the court.'}
          </Typography>
          {featured?.registrationDeadline && (
            <Typography variant="body1" className={styles.heroDeadlineText}>
              Registration deadline:{' '}
              <strong>
                {new Date(featured.registrationDeadline).toLocaleDateString('en-CA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </strong>
            </Typography>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              size="large"
              variant="contained"
              component={RouterLink}
              to="/register"
              className={styles.heroRegisterBtn}
            >
              Register to play
            </Button>
            <Button size="large" variant="outlined" color="inherit" component={RouterLink} to="/login"
              className={styles.heroLoginBtn}
            >
              View my team
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box className={styles.contentWrapper}>
        {/* Volleyball court background */}
        <svg viewBox="0 0 1600 600" className={styles.courtBgSvg} aria-hidden="true" preserveAspectRatio="xMidYTop slice" xmlns="http://www.w3.org/2000/svg">
          {/* Net left pole */}
          <rect x="60" y="20" width="7" height="220" fill="rgba(15,29,53,0.12)" rx="3" />
          {/* Net right pole */}
          <rect x="1533" y="20" width="7" height="220" fill="rgba(15,29,53,0.12)" rx="3" />

          {/* Top cable */}
          <path d="M64 23 Q800 13 1537 23" stroke="rgba(15,29,53,0.18)" strokeWidth="3.5" fill="none" />
          {/* Bottom tape */}
          <line x1="64" y1="200" x2="1537" y2="200" stroke="rgba(15,29,53,0.18)" strokeWidth="3" />

          {/* Net horizontal lines */}
          <line x1="65" y1="50"  x2="1535" y2="50"  stroke="rgba(15,29,53,0.07)" strokeWidth="1" />
          <line x1="65" y1="75"  x2="1535" y2="75"  stroke="rgba(15,29,53,0.07)" strokeWidth="1" />
          <line x1="65" y1="100" x2="1535" y2="100" stroke="rgba(15,29,53,0.07)" strokeWidth="1" />
          <line x1="65" y1="125" x2="1535" y2="125" stroke="rgba(15,29,53,0.12)" strokeWidth="2.5" />
          <line x1="65" y1="150" x2="1535" y2="150" stroke="rgba(15,29,53,0.07)" strokeWidth="1" />
          <line x1="65" y1="175" x2="1535" y2="175" stroke="rgba(15,29,53,0.07)" strokeWidth="1" />

          {/* Net vertical lines */}
          {Array.from({ length: 50 }, (_, i) => (
            <line key={i} x1={95 + i * 29} y1="23" x2={95 + i * 29} y2="200"
              stroke="rgba(15,29,53,0.06)" strokeWidth="1" />
          ))}

          {/* Volleyball */}
          <circle cx="1320" cy="72" r="52" fill="rgba(249,115,22,0.13)" />
          <circle cx="1320" cy="72" r="52" fill="none" stroke="rgba(249,115,22,0.2)" strokeWidth="2" />
          <path d="M1278 54 Q1320 36 1362 54"  stroke="rgba(249,115,22,0.22)" strokeWidth="3" fill="none" />
          <path d="M1268 76 Q1320 62 1372 76"  stroke="rgba(249,115,22,0.22)" strokeWidth="3" fill="none" />
          <path d="M1276 98 Q1320 108 1364 98" stroke="rgba(249,115,22,0.22)" strokeWidth="3" fill="none" />
          <path d="M1303 24 Q1316 72 1303 120"  stroke="rgba(249,115,22,0.16)" strokeWidth="2" fill="none" />
          <path d="M1337 24 Q1324 72 1337 120"  stroke="rgba(249,115,22,0.16)" strokeWidth="2" fill="none" />

          {/* Player silhouette — jumping spike */}
          <g fill="rgba(15,29,53,0.09)" stroke="rgba(15,29,53,0.09)">
            <circle cx="1390" cy="110" r="20" />
            <ellipse cx="1390" cy="160" rx="16" ry="30" />
            <path d="M1382 135 Q1348 95 1322 68"  strokeWidth="13" strokeLinecap="round" fill="none" />
            <path d="M1398 142 Q1424 155 1435 175" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M1382 188 Q1364 220 1356 248" strokeWidth="13" strokeLinecap="round" fill="none" />
            <path d="M1398 188 Q1416 220 1424 248" strokeWidth="13" strokeLinecap="round" fill="none" />
          </g>
        </svg>

        <Container maxWidth="lg" className={styles.contentContainer}>
        {sorted.length === 0 ? (
          <Typography color="text.secondary">No tournaments published yet — check back soon.</Typography>
        ) : (
          <>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={2}
              mb={2}
            >
              <Typography variant="h4">Tournament</Typography>
              <TextField
                select
                size="small"
                label="Tournament"
                value={tournamentId ?? ''}
                onChange={(e) => {
                  setSelectedId(Number(e.target.value));
                  setTab(0);
                }}
                className={styles.tournamentSelect}
              >
                {sorted.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name} — {new Date(t.date).toLocaleDateString()}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} className={styles.tabs}>
              <Tab label="Teams" />
              <Tab label="Schedule & Results" />
              <Tab label="Standings" />
            </Tabs>

            {tab === 0 && <TeamsSection tournamentId={tournamentId} />}
            {tab === 1 && <ScheduleSection tournamentId={tournamentId} />}
            {tab === 2 && <StandingsSection tournamentId={tournamentId} />}
          </>
        )}
      </Container>
      </Box>
    </Box>
  );
}

function TeamsSection({ tournamentId }: { tournamentId: number | null }) {
  const { data: teams } = usePublicTeams(tournamentId);
  if (!teams) return <Typography color="text.secondary">Loading teams…</Typography>;
  if (teams.length === 0) {
    return <Typography color="text.secondary">Teams haven't been announced yet.</Typography>;
  }
  return (
    <Grid container spacing={2}>
      {teams.map((team) => (
        <Grid item xs={12} sm={6} md={4} key={team.id}>
          <TeamCard team={team} />
        </Grid>
      ))}
    </Grid>
  );
}

function TeamCard({ team }: { team: PublicTeam }) {
  return (
    <Card className={styles.teamCard}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">{team.name}</Typography>
          {team.groupLabel && <Chip size="small" label={`Group ${team.groupLabel}`} />}
        </Stack>
        <Stack spacing={1}>
          {team.members.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No players yet.
            </Typography>
          )}
          {team.members.map((m) => (
            <Stack key={m.playerId} direction="row" spacing={1.5} alignItems="center">
              <Avatar src={m.photoUrl ?? undefined} className={styles.memberAvatar} />
              <Typography>{m.fullName}</Typography>
              {m.captain && (
                <Tooltip title="Captain">
                  <StarIcon fontSize="small" color="warning" />
                </Tooltip>
              )}
            </Stack>
          ))}
        </Stack>
        {team.refereeName && (
          <Stack direction="row" spacing={1} alignItems="center" mt={1.5} pt={1.5} className={styles.refereeSection}>
            <SportsIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Referee: <strong>{team.refereeName}</strong>
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function scoreLabel(m: MatchResponse): string {
  if (m.status !== 'COMPLETE') return '—';
  const home = m.sets.reduce((n, s) => n + (s.homePoints > s.awayPoints ? 1 : 0), 0);
  const away = m.sets.reduce((n, s) => n + (s.awayPoints > s.homePoints ? 1 : 0), 0);
  if (m.sets.length === 1) return `${m.sets[0].homePoints}–${m.sets[0].awayPoints}`;
  return `${home}–${away} (sets)`;
}

function ScheduleSection({ tournamentId }: { tournamentId: number | null }) {
  const { data: schedule } = usePublicSchedule(tournamentId);
  if (!schedule) return <Typography color="text.secondary">Loading schedule…</Typography>;
  if (schedule.length === 0) {
    return <Typography color="text.secondary">The schedule hasn't been published yet.</Typography>;
  }
  const pool = schedule.filter((m) => m.stage === 'POOL');
  const bracket = schedule.filter((m) => m.stage !== 'POOL');

  const finalMatch = bracket.find((m) => m.stage === 'FINAL');
  const bronzeMatch = bracket.find((m) => m.stage === 'BRONZE');
  const podium = finalMatch?.status === 'COMPLETE'
    ? {
        gold: finalMatch.winnerTeamId === finalMatch.homeTeamId ? finalMatch.homeTeamName : finalMatch.awayTeamName,
        silver: finalMatch.winnerTeamId === finalMatch.homeTeamId ? finalMatch.awayTeamName : finalMatch.homeTeamName,
        bronze: bronzeMatch?.status === 'COMPLETE'
          ? (bronzeMatch.winnerTeamId === bronzeMatch.homeTeamId ? bronzeMatch.homeTeamName : bronzeMatch.awayTeamName)
          : null,
      }
    : null;

  return (
    <>
      {podium && (
        <Box mb={3}>
          <PublicPodiumCard gold={podium.gold} silver={podium.silver} bronze={podium.bronze} />
        </Box>
      )}
      <Typography variant="h6" gutterBottom>
        Pool matches
      </Typography>
      <MatchTable matches={pool} showGroup />
      {bracket.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom className={styles.playoffsHeading}>
            Playoffs
          </Typography>
          <MatchTable matches={bracket} />
        </>
      )}
    </>
  );
}

function PublicPodiumCard({
  gold,
  silver,
  bronze,
}: {
  gold: string | null | undefined;
  silver: string | null | undefined;
  bronze: string | null | undefined;
}) {
  return (
    <Paper className={styles.podiumCard} elevation={4}>
      <Typography variant="h5" className={styles.podiumTitle}>
        🏆 Tournament Results
      </Typography>
      <Box className={styles.podiumRow}>
        <Box className={styles.podiumItem}>
          <Box className={styles.medalEmoji}>🥈</Box>
          <Typography className={styles.podiumLabel}>Runner-Up</Typography>
          <Typography variant="h6" className={styles.podiumTeam}>{silver ?? '—'}</Typography>
        </Box>
        <Box className={`${styles.podiumItem} ${styles.podiumGold}`}>
          <Box className={styles.medalEmoji}>🥇</Box>
          <Typography className={styles.podiumLabel}>Champion</Typography>
          <Typography variant="h5" className={styles.podiumTeamGold}>{gold ?? '—'}</Typography>
        </Box>
        <Box className={styles.podiumItem}>
          <Box className={styles.medalEmoji}>{bronze ? '🥉' : '—'}</Box>
          <Typography className={styles.podiumLabel}>Third Place</Typography>
          <Typography variant="h6" className={styles.podiumTeam}>{bronze ?? 'TBD'}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function MatchTable({ matches, showGroup }: { matches: MatchResponse[]; showGroup?: boolean }) {
  if (matches.length === 0) return <Typography color="text.secondary">No matches.</Typography>;
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Court</TableCell>
            {showGroup && <TableCell>Grp</TableCell>}
            <TableCell>Match</TableCell>
            <TableCell>Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map((m) => {
            const time = m.scheduledStart
              ? new Date(m.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '—';
            return (
              <TableRow key={m.id} hover>
                <TableCell>{time}</TableCell>
                <TableCell>{m.court ?? '—'}</TableCell>
                {showGroup && <TableCell>{m.groupLabel}</TableCell>}
                <TableCell>
                  <Box className={m.winnerTeamId === m.homeTeamId ? styles.matchCellBold : styles.matchCellNormal}>
                    {m.homeTeamName ?? 'TBD'}
                  </Box>
                  <Box className={m.winnerTeamId === m.awayTeamId ? styles.matchCellBold : styles.matchCellNormal}>
                    {m.awayTeamName ?? 'TBD'}
                  </Box>
                  {m.bracketSlot && <Chip size="small" label={m.bracketSlot} className={styles.bracketChip} />}
                </TableCell>
                <TableCell>{scoreLabel(m)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function StandingsSection({ tournamentId }: { tournamentId: number | null }) {
  const { data: standings } = usePublicStandings(tournamentId);
  if (!standings) return <Typography color="text.secondary">Loading standings…</Typography>;
  if (standings.length === 0) {
    return <Typography color="text.secondary">No standings yet — results haven't been recorded.</Typography>;
  }
  return (
    <Grid container spacing={3}>
      {standings.map((g) => (
        <Grid item xs={12} md={6} key={g.groupLabel}>
          <StandingsTable group={g} />
        </Grid>
      ))}
    </Grid>
  );
}

function StandingsTable({ group }: { group: StandingGroup }) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700}>
        Group {group.groupLabel}
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Team</TableCell>
              <TableCell align="right">W</TableCell>
              <TableCell align="right">L</TableCell>
              <TableCell align="right">Sets</TableCell>
              <TableCell align="right">+/−</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {group.rows.map((r) => (
              <TableRow key={r.teamId} className={r.rank <= 2 ? styles.topTwoRow : ''}>
                <TableCell>{r.rank}</TableCell>
                <TableCell>{r.teamName}</TableCell>
                <TableCell align="right">{r.wins}</TableCell>
                <TableCell align="right">{r.losses}</TableCell>
                <TableCell align="right">
                  {r.setsWon}-{r.setsLost}
                </TableCell>
                <TableCell align="right">{r.pointDiff > 0 ? `+${r.pointDiff}` : r.pointDiff}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary">
        Top 2 (shaded) advance to the semifinals.
      </Typography>
    </Box>
  );
}
