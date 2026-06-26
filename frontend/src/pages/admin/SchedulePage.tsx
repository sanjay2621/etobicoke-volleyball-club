import { useEffect, useState } from 'react';
import { TruncatedText } from '../../components/TruncatedText';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useActiveTournaments } from '../../api/tournaments';
import { downloadFile } from '../../api/client';
import { useGeneratePlayoffs, useGeneratePools, useSchedule, useStandings } from '../../api/schedule';
import type { MatchResponse, StandingGroup } from '../../types';
import { ResultDialog } from './ResultDialog';
import styles from './SchedulePage.module.css';

export function SchedulePage() {
  const { data: tournaments } = useActiveTournaments();
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const { data: schedule } = useSchedule(tournamentId);
  const { data: standings } = useStandings(tournamentId);
  const genPools = useGeneratePools();
  const genPlayoffs = useGeneratePlayoffs();
  const [editingMatch, setEditingMatch] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tournamentId == null && tournaments && tournaments.length > 0) {
      setTournamentId(tournaments[0].id);
    }
  }, [tournaments, tournamentId]);

  async function run(action: () => Promise<unknown>, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setError(null);
    try {
      await action();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Operation failed');
    }
  }

  const pool = schedule?.filter((m) => m.stage === 'POOL') ?? [];
  const bracket = schedule?.filter((m) => m.stage !== 'POOL') ?? [];

  const finalMatch = bracket.find((m) => m.stage === 'FINAL');
  const bronzeMatch = bracket.find((m) => m.stage === 'BRONZE');

  const podium = finalMatch?.status === 'COMPLETE'
    ? {
        gold: finalMatch.winnerTeamId === finalMatch.homeTeamId
          ? finalMatch.homeTeamName
          : finalMatch.awayTeamName,
        silver: finalMatch.winnerTeamId === finalMatch.homeTeamId
          ? finalMatch.awayTeamName
          : finalMatch.homeTeamName,
        bronze: bronzeMatch?.status === 'COMPLETE'
          ? (bronzeMatch.winnerTeamId === bronzeMatch.homeTeamId
              ? bronzeMatch.homeTeamName
              : bronzeMatch.awayTeamName)
          : null,
      }
    : null;

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h4">Schedule &amp; Standings</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            select
            size="small"
            label="Tournament"
            value={tournamentId ?? ''}
            onChange={(e) => setTournamentId(Number(e.target.value))}
            className={styles.tournamentSelect}
          >
            {tournaments?.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            onClick={() => tournamentId && run(() => genPools.mutateAsync(tournamentId),
              'Generate the pool schedule? This replaces any existing matches.')}
          >
            Generate pools
          </Button>
          <Button
            variant="contained"
            onClick={() => tournamentId && run(() => genPlayoffs.mutateAsync(tournamentId))}
          >
            Generate playoffs
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={!tournamentId}
            onClick={() =>
              tournamentId &&
              downloadFile(`/schedule/${tournamentId}/export`, `schedule-${tournamentId}.csv`)
            }
          >
            CSV
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" className={styles.errorAlert}>{error}</Alert>}

      <Grid container spacing={3}>
        {podium && (
          <Grid item xs={12}>
            <PodiumCard gold={podium.gold} silver={podium.silver} bronze={podium.bronze} />
          </Grid>
        )}

        <Grid item xs={12} lg={7}>
          <Typography variant="h6" gutterBottom>Pool matches</Typography>
          <MatchTable matches={pool} onEnter={setEditingMatch} showGroup />

          {bracket.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom className={styles.playoffsHeading}>Playoffs</Typography>
              <MatchTable matches={bracket} onEnter={setEditingMatch} />
            </>
          )}
        </Grid>

        <Grid item xs={12} lg={5}>
          <Typography variant="h6" gutterBottom>Standings</Typography>
          {(!standings || standings.length === 0) && (
            <Typography color="text.secondary">No standings yet — generate pools and record results.</Typography>
          )}
          {standings?.map((g) => <StandingsTable key={g.groupLabel} group={g} />)}
        </Grid>
      </Grid>

      <ResultDialog match={editingMatch} onClose={() => setEditingMatch(null)} />
    </>
  );
}

function PodiumCard({
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
          <Typography variant="h6" className={styles.podiumTeam}><TruncatedText text={silver ?? '—'} /></Typography>
        </Box>
        <Box className={`${styles.podiumItem} ${styles.podiumGold}`}>
          <Box className={styles.medalEmoji}>🥇</Box>
          <Typography className={styles.podiumLabel}>Champion</Typography>
          <Typography variant="h5" className={styles.podiumTeamGold}><TruncatedText text={gold ?? '—'} /></Typography>
        </Box>
        <Box className={styles.podiumItem}>
          <Box className={styles.medalEmoji}>{bronze ? '🥉' : '—'}</Box>
          <Typography className={styles.podiumLabel}>Third Place</Typography>
          <Typography variant="h6" className={styles.podiumTeam}><TruncatedText text={bronze ?? 'TBD'} /></Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function scoreLabel(m: MatchResponse): string {
  if (m.status !== 'COMPLETE') return '—';
  const home = m.sets.reduce((n, s) => n + (s.homePoints > s.awayPoints ? 1 : 0), 0);
  const away = m.sets.reduce((n, s) => n + (s.awayPoints > s.homePoints ? 1 : 0), 0);
  if (m.sets.length === 1) return `${m.sets[0].homePoints}–${m.sets[0].awayPoints}`;
  return `${home}–${away} (sets)`;
}

function MatchTable({
  matches,
  onEnter,
  showGroup,
}: {
  matches: MatchResponse[];
  onEnter: (m: MatchResponse) => void;
  showGroup?: boolean;
}) {
  if (matches.length === 0) {
    return <Typography color="text.secondary">No matches.</Typography>;
  }
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
            <TableCell align="right">Result</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map((m) => {
            const time = m.scheduledStart
              ? new Date(m.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '—';
            const ready = m.homeTeamId != null && m.awayTeamId != null;
            return (
              <TableRow key={m.id} hover>
                <TableCell>{time}</TableCell>
                <TableCell>{m.court ?? '—'}</TableCell>
                {showGroup && <TableCell>{m.groupLabel}</TableCell>}
                <TableCell sx={{ maxWidth: 180 }}>
                  <Box className={m.winnerTeamId === m.homeTeamId ? styles.matchCellBold : styles.matchCellNormal}>
                    <TruncatedText text={m.homeTeamName ?? 'TBD'} />
                  </Box>
                  <Box className={m.winnerTeamId === m.awayTeamId ? styles.matchCellBold : styles.matchCellNormal}>
                    <TruncatedText text={m.awayTeamName ?? 'TBD'} />
                  </Box>
                  {m.bracketSlot && <Chip size="small" label={m.bracketSlot} className={styles.bracketChip} />}
                </TableCell>
                <TableCell>{scoreLabel(m)}</TableCell>
                <TableCell align="right">
                  <Button size="small" disabled={!ready} onClick={() => onEnter(m)}>
                    {m.status === 'COMPLETE' ? 'Edit' : 'Enter'}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function StandingsTable({ group }: { group: StandingGroup }) {
  return (
    <Box className={styles.standingsGroup}>
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
                <TableCell sx={{ maxWidth: 150 }}><TruncatedText text={r.teamName} /></TableCell>
                <TableCell align="right">{r.wins}</TableCell>
                <TableCell align="right">{r.losses}</TableCell>
                <TableCell align="right">{r.setsWon}-{r.setsLost}</TableCell>
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
