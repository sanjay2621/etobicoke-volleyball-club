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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <SportsVolleyballIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Poppins' }}>
            Etobicoke Volleyball Club
          </Typography>
          <Button color="inherit" component={RouterLink} to="/login">
            Log in
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          background: 'linear-gradient(135deg, #1A2B4A 0%, #2C4A7A 100%)',
          color: 'common.white',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom>
            Game on. Register your spot.
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, mb: 4, fontWeight: 400 }}>
            {featured
              ? `${featured.name} — ${new Date(featured.date).toLocaleDateString()} at ${featured.startTime?.slice(0, 5)}`
              : 'Sign up, get drafted, and hit the court.'}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button size="large" variant="contained" color="secondary" component={RouterLink} to="/register">
              Register to play
            </Button>
            <Button size="large" variant="outlined" color="inherit" component={RouterLink} to="/login">
              View my team
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
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
                sx={{ minWidth: 240 }}
              >
                {sorted.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name} — {new Date(t.date).toLocaleDateString()}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
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
    <Card sx={{ height: '100%' }}>
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
              <Avatar src={m.photoUrl ?? undefined} sx={{ width: 32, height: 32 }} />
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
          <Stack direction="row" spacing={1} alignItems="center" mt={1.5} pt={1.5} sx={{ borderTop: 1, borderColor: 'divider' }}>
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
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Pool matches
      </Typography>
      <MatchTable matches={pool} showGroup />
      {bracket.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Playoffs
          </Typography>
          <MatchTable matches={bracket} />
        </>
      )}
    </>
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
                  <Box sx={{ fontWeight: m.winnerTeamId === m.homeTeamId ? 700 : 400 }}>
                    {m.homeTeamName ?? 'TBD'}
                  </Box>
                  <Box sx={{ fontWeight: m.winnerTeamId === m.awayTeamId ? 700 : 400 }}>
                    {m.awayTeamName ?? 'TBD'}
                  </Box>
                  {m.bracketSlot && <Chip size="small" label={m.bracketSlot} sx={{ mt: 0.5 }} />}
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
              <TableRow key={r.teamId} sx={{ bgcolor: r.rank <= 2 ? 'action.hover' : undefined }}>
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
