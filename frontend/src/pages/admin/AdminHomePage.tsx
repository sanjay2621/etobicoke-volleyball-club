import { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Divider, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useActiveTournaments } from '../../api/tournaments';
import { usePlayers } from '../../api/players';
import { useTeams } from '../../api/teams';
import { useSchedule } from '../../api/schedule';
import { useDraftState } from '../../api/draft';
import { TSHIRT_SIZES } from '../../types';
import styles from './AdminHomePage.module.css';

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Grid item xs={6} sm={4} md={3}>
      <Card>
        <CardContent>
          <Typography variant="h4" color="primary">
            {value}
          </Typography>
          <Typography color="text.secondary">{label}</Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}

export function AdminHomePage() {
  const { data: tournaments } = useActiveTournaments();
  const [tournamentId, setTournamentId] = useState<number | null>(null);

  useEffect(() => {
    if (tournamentId == null && tournaments && tournaments.length > 0) {
      setTournamentId(tournaments[0].id);
    }
  }, [tournaments, tournamentId]);

  const { data: players } = usePlayers(tournamentId);
  const { data: teams } = useTeams(tournamentId);
  const { data: schedule } = useSchedule(tournamentId);
  const { data: draft } = useDraftState(tournamentId);

  const matches = schedule ?? [];
  const completed = matches.filter((m) => m.status === 'COMPLETE').length;
  const selected = tournaments?.find((t) => t.id === tournamentId);

  const tshirtCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sz of TSHIRT_SIZES) counts[sz] = 0;
    (players ?? []).forEach((p) => { if (p.tshirtSize) counts[p.tshirtSize]++; });
    return counts;
  }, [players]);

  const tshirtTotal = TSHIRT_SIZES.reduce((sum, sz) => sum + (tshirtCounts[sz] ?? 0), 0);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h4">Dashboard</Typography>
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
      </Stack>

      {!selected && <Typography color="text.secondary">Create a tournament to get started.</Typography>}

      {selected && (
        <Grid container spacing={2}>
          <StatCard label="Registered players" value={players?.length ?? 0} />
          <StatCard label="Teams" value={teams?.length ?? 0} />
          <StatCard
            label="Matches"
            value={matches.length}
            hint={matches.length ? `${completed} completed` : 'not scheduled yet'}
          />
          <StatCard label="Draft" value={draft?.status?.replace('_', ' ') ?? '—'} />
          <StatCard label="Status" value={selected.status} />
          <StatCard label="Registration" value={selected.registrationOpen ? 'Open' : 'Closed'} />
          <StatCard label="Courts" value={selected.numberOfCourts} />
          <StatCard
            label="Players w/ login"
            value={players?.filter((p) => p.hasAccount).length ?? 0}
          />

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  T-Shirt Sizes Required
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={3} alignItems="center">
                  {TSHIRT_SIZES.map((sz) => (
                    <Box key={sz} className={styles.tshirtStat}>
                      <Typography variant="h4" color="primary">
                        {tshirtCounts[sz]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sz}
                      </Typography>
                    </Box>
                  ))}
                  <Divider orientation="vertical" flexItem />
                  <Box className={styles.tshirtStat}>
                    <Typography variant="h4" color="text.primary">
                      {tshirtTotal}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
}
