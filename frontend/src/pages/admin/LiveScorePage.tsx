import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import { useActiveTournaments } from '../../api/tournaments';
import { useSchedule, useAdjustLiveScore } from '../../api/schedule';
import { TSHIRT_COLORS } from '../../types';
import styles from './LiveScorePage.module.css';

export function LiveScorePage() {
  const { data: tournaments } = useActiveTournaments();
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const { data: schedule } = useSchedule(tournamentId);
  const adjust = useAdjustLiveScore();

  const [matchId, setMatchId] = useState<number | null>(null);

  useEffect(() => {
    if (tournamentId == null && tournaments?.length) {
      setTournamentId(tournaments[0].id);
    }
  }, [tournaments, tournamentId]);

  const matches = useMemo(
    () => (schedule ?? []).filter((m) => m.homeTeamId != null && m.awayTeamId != null && m.status !== 'COMPLETE'),
    [schedule],
  );

  const selectedMatch = useMemo(() => matches.find((m) => m.id === matchId), [matches, matchId]);

  const colorMap = useMemo(() => new Map(TSHIRT_COLORS.map((c) => [c.label, c.hex])), []);
  const hexFor = (label: string | null | undefined) => (label && colorMap.get(label)) || undefined;

  function bump(side: 'HOME' | 'AWAY', delta: number) {
    if (!selectedMatch) return;
    adjust.mutate({ matchId: selectedMatch.id, side, delta });
  }

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ScoreboardIcon />
          <Typography variant="h4">Live Score</Typography>
        </Stack>
        <TextField
          select
          size="small"
          label="Tournament"
          value={tournamentId ?? ''}
          onChange={(e) => {
            setTournamentId(Number(e.target.value));
            setMatchId(null);
          }}
          className={styles.tournamentSelect}
        >
          {tournaments?.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            select
            fullWidth
            size="small"
            label="Select Match"
            value={matchId ?? ''}
            onChange={(e) => setMatchId(Number(e.target.value))}
          >
            {matches.length === 0 ? (
              <MenuItem disabled>No scoreable matches</MenuItem>
            ) : (
              matches.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.homeTeamName} vs {m.awayTeamName}
                  {m.court != null ? ` — Court ${m.court}` : ''}
                </MenuItem>
              ))
            )}
          </TextField>
        </CardContent>
      </Card>

      {selectedMatch && (
        <Grid container spacing={3}>
          {(
            [
              { side: 'HOME' as const, name: selectedMatch.homeTeamName, points: selectedMatch.liveHomePoints, color: hexFor(selectedMatch.homeTshirtColor) },
              { side: 'AWAY' as const, name: selectedMatch.awayTeamName, points: selectedMatch.liveAwayPoints, color: hexFor(selectedMatch.awayTshirtColor) },
            ]
          ).map((t) => (
            <Grid item xs={12} sm={6} key={t.side}>
              <Card variant="outlined" className={styles.teamCard}>
                <CardContent className={styles.teamCardContent}>
                  <Typography variant="h6" className={styles.teamName} style={{ color: t.color }}>
                    {t.name}
                  </Typography>
                  <Typography variant="h1" className={styles.scoreNumber} style={{ color: t.color }}>
                    {t.points}
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <IconButton
                      size="large"
                      color="error"
                      className={styles.scoreBtn}
                      disabled={adjust.isPending}
                      onClick={() => bump(t.side, -1)}
                    >
                      <RemoveIcon fontSize="large" />
                    </IconButton>
                    <IconButton
                      size="large"
                      color="success"
                      className={styles.scoreBtn}
                      disabled={adjust.isPending}
                      onClick={() => bump(t.side, 1)}
                    >
                      <AddIcon fontSize="large" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!selectedMatch && matches.length > 0 && (
        <Box textAlign="center" mt={4}>
          <Button variant="text" disabled>
            Select a match above to start live scoring
          </Button>
        </Box>
      )}
    </>
  );
}
