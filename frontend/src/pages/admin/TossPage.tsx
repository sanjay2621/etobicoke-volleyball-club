import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useActiveTournaments } from '../../api/tournaments';
import { useSchedule } from '../../api/schedule';
import { useTeams } from '../../api/teams';
import styles from './TossPage.module.css';

type Phase = 'setup' | 'flipping' | 'result';

export function TossPage() {
  const { data: tournaments } = useActiveTournaments();
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const { data: schedule } = useSchedule(tournamentId);
  const { data: teams } = useTeams(tournamentId);

  const [matchId, setMatchId] = useState<number | null>(null);
  const [callingTeamId, setCallingTeamId] = useState<number | null>(null);
  const [call, setCall] = useState<'HEADS' | 'TAILS' | null>(null);
  const [result, setResult] = useState<'HEADS' | 'TAILS' | null>(null);
  const [phase, setPhase] = useState<Phase>('setup');

  useEffect(() => {
    if (tournamentId == null && tournaments?.length) {
      setTournamentId(tournaments[0].id);
    }
  }, [tournaments, tournamentId]);

  const matches = useMemo(
    () => (schedule ?? []).filter((m) => m.homeTeamId != null && m.awayTeamId != null),
    [schedule],
  );

  const selectedMatch = useMemo(
    () => matches.find((m) => m.id === matchId),
    [matches, matchId],
  );

  const captainMap = useMemo(() => {
    const map = new Map<number, string>();
    teams?.forEach((t) => {
      const cap = t.members.find((m) => m.captain);
      if (cap) map.set(t.id, cap.fullName);
    });
    return map;
  }, [teams]);

  function selectMatch(id: number) {
    setMatchId(id);
    setCallingTeamId(null);
    setCall(null);
    setResult(null);
    setPhase('setup');
  }

  function flipCoin() {
    setPhase('flipping');
    setResult(null);
    setTimeout(() => {
      setResult(Math.random() < 0.5 ? 'HEADS' : 'TAILS');
      setPhase('result');
    }, 2000);
  }

  function reset() {
    setCallingTeamId(null);
    setCall(null);
    setResult(null);
    setPhase('setup');
  }

  const callingTeamName =
    selectedMatch && callingTeamId != null
      ? callingTeamId === selectedMatch.homeTeamId
        ? selectedMatch.homeTeamName
        : selectedMatch.awayTeamName
      : null;

  const callingCaptain = callingTeamId != null ? captainMap.get(callingTeamId) : null;
  const won = phase === 'result' && result != null && call != null && result === call;

  const statusHint =
    !matchId
      ? 'Select a match to begin.'
      : !callingTeamId
      ? 'Choose which team calls the toss.'
      : !call
      ? 'Captain must call Heads or Tails.'
      : 'Ready — referee clicks Flip Coin.';

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <MonetizationOnIcon />
          <Typography variant="h4">Coin Toss</Typography>
        </Stack>
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

      <Grid container spacing={3}>
        {/* ── Setup panel ── */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Setup
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                label="Select Match"
                value={matchId ?? ''}
                onChange={(e) => selectMatch(Number(e.target.value))}
                sx={{ mb: 2 }}
              >
                {matches.length === 0 ? (
                  <MenuItem disabled>No matches scheduled yet</MenuItem>
                ) : (
                  matches.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.homeTeamName} vs {m.awayTeamName}
                    </MenuItem>
                  ))
                )}
              </TextField>

              {selectedMatch && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Which team's captain calls?
                  </Typography>
                  <Stack direction="row" spacing={1} mb={2}>
                    <Button
                      fullWidth
                      variant={callingTeamId === selectedMatch.homeTeamId ? 'contained' : 'outlined'}
                      onClick={() => {
                        setCallingTeamId(selectedMatch.homeTeamId ?? null);
                        setCall(null);
                      }}
                    >
                      {selectedMatch.homeTeamName}
                    </Button>
                    <Button
                      fullWidth
                      variant={callingTeamId === selectedMatch.awayTeamId ? 'contained' : 'outlined'}
                      onClick={() => {
                        setCallingTeamId(selectedMatch.awayTeamId ?? null);
                        setCall(null);
                      }}
                    >
                      {selectedMatch.awayTeamName}
                    </Button>
                  </Stack>

                  {callingTeamId != null && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        {callingCaptain
                          ? `${callingCaptain} (${callingTeamName}) calls:`
                          : `${callingTeamName} calls:`}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          variant={call === 'HEADS' ? 'contained' : 'outlined'}
                          color={call === 'HEADS' ? 'secondary' : 'inherit'}
                          disabled={phase === 'flipping'}
                          onClick={() => setCall('HEADS')}
                        >
                          Heads
                        </Button>
                        <Button
                          fullWidth
                          variant={call === 'TAILS' ? 'contained' : 'outlined'}
                          color={call === 'TAILS' ? 'secondary' : 'inherit'}
                          disabled={phase === 'flipping'}
                          onClick={() => setCall('TAILS')}
                        >
                          Tails
                        </Button>
                      </Stack>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Toss panel ── */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" className={styles.tossCard}>
            <CardContent className={styles.tossCardContent}>
              <Typography variant="h6" gutterBottom>
                Referee Toss
              </Typography>

              {/* Coin */}
              <Box className={styles.coinWrapper}>
                <Box
                  className={[
                    styles.coin,
                    phase === 'flipping' ? styles.coinFlipping : '',
                    phase === 'result' && result === 'TAILS' ? styles.coinTails : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className={styles.coinLabel}>
                    {phase === 'flipping'
                      ? '?'
                      : phase === 'result'
                      ? result === 'HEADS'
                        ? 'H'
                        : 'T'
                      : '🪙'}
                  </span>
                </Box>
              </Box>

              {/* Result message */}
              {phase === 'result' && result && callingTeamName && (
                <Box textAlign="center" mb={3}>
                  <Typography variant="h3" fontWeight={900} letterSpacing={2} mb={1}>
                    {result}!
                  </Typography>
                  <Chip
                    label={
                      won
                        ? `🎉 ${callingTeamName} wins the toss!`
                        : `${callingTeamName} loses the toss`
                    }
                    color={won ? 'success' : 'error'}
                    sx={{ fontSize: '0.95rem', height: 36, px: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Called: {call} · Result: {result}
                  </Typography>
                </Box>
              )}

              {phase !== 'result' && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  mb={3}
                >
                  {statusHint}
                </Typography>
              )}

              {/* Action buttons */}
              <Stack direction="row" spacing={2} justifyContent="center">
                {phase !== 'result' ? (
                  <Button
                    variant="contained"
                    size="large"
                    className={styles.flipBtn}
                    disabled={!matchId || !callingTeamId || !call || phase === 'flipping'}
                    onClick={flipCoin}
                  >
                    {phase === 'flipping' ? 'Flipping…' : '🪙 Flip Coin'}
                  </Button>
                ) : (
                  <>
                    <Button variant="outlined" size="large" onClick={reset}>
                      Toss Again
                    </Button>
                    <Button
                      variant="text"
                      size="large"
                      onClick={() => {
                        setMatchId(null);
                        reset();
                      }}
                    >
                      New Match
                    </Button>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
