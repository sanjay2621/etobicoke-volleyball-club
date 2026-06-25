import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useActiveTournaments } from '../../api/tournaments';
import { useDraftState, usePick, useStartDraft } from '../../api/draft';
import styles from './DraftPage.module.css';

export function DraftPage() {
  const { data: tournaments } = useActiveTournaments();
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const { data: draft } = useDraftState(tournamentId);
  const start = useStartDraft();
  const pick = usePick();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tournamentId == null && tournaments && tournaments.length > 0) {
      setTournamentId(tournaments[0].id);
    }
  }, [tournaments, tournamentId]);

  async function onStart() {
    if (!tournamentId) return;
    setError(null);
    try {
      await start.mutateAsync({ tournamentId });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Could not start the draft');
    }
  }

  async function onPick(playerId: number) {
    if (!tournamentId) return;
    setError(null);
    try {
      await pick.mutateAsync({ tournamentId, playerId });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Pick failed');
    }
  }

  const inProgress = draft?.status === 'IN_PROGRESS';
  const complete = draft?.status === 'COMPLETE';

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h4">Draft</Typography>
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
          {draft?.status === 'NOT_STARTED' && (
            <Button variant="contained" onClick={onStart}>
              Start draft
            </Button>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" className={styles.errorAlert}>
          {error}
        </Alert>
      )}

      {draft && (
        <Paper className={styles.statusPaper} variant="outlined">
          {inProgress && (
            <Typography variant="h6">
              Round {draft.currentRound} / {draft.totalRounds} — on the clock:{' '}
              <Box component="span" color="secondary.main" fontWeight={700}>
                {draft.onTheClockTeamName}
              </Box>
            </Typography>
          )}
          {complete && <Typography variant="h6">Draft complete 🎉 — rosters are set.</Typography>}
          {draft.status === 'NOT_STARTED' && (
            <Typography color="text.secondary">
              Designate a captain on every team (Teams page), then start the draft.
            </Typography>
          )}
        </Paper>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            {draft?.teams.map((team) => {
              const onClock = team.id === draft.onTheClockTeamId;
              return (
                <Grid item xs={12} sm={6} key={team.id}>
                  <Card
                    variant="outlined"
                    className={onClock ? styles.teamCardOnClock : ''}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700}>
                          {team.name}
                        </Typography>
                        <Chip size="small" label={`${team.memberCount}`} />
                      </Stack>
                      <List dense>
                        {team.members.map((m) => (
                          <ListItem key={m.playerId} disableGutters>
                            <ListItemText
                              primary={
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <span>{m.fullName}</span>
                                  {m.captain && <StarIcon fontSize="inherit" color="warning" />}
                                </Stack>
                              }
                              secondary={m.draftRound ? `R${m.draftRound}` : m.captain ? 'Captain' : null}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        <Grid item xs={12} md={5}>
          {(() => {
            const draftable = draft?.availablePlayers.filter((p) => !p.preferredPositions.includes('REFEREE')) ?? [];
            return (
              <>
                <Typography variant="h6" gutterBottom>
                  Available players ({draftable.length})
                </Typography>
                <Paper variant="outlined" className={styles.availableList}>
                  <List dense>
                    {draftable.map((p) => (
                      <ListItem
                        key={p.id}
                        secondaryAction={
                          <Button
                            size="small"
                            variant="contained"
                            disabled={!inProgress || pick.isPending}
                            onClick={() => onPick(p.id)}
                          >
                            Draft
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar src={p.photoUrl ?? undefined} className={styles.avatar} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={p.fullName}
                          secondary={`${p.preferredPositions.join(', ')}${p.skillLevel ? ' · ' + p.skillLevel : ''}`}
                        />
                      </ListItem>
                    ))}
                    {draftable.length === 0 && (
                      <ListItem>
                        <ListItemText primary="No players available." />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </>
            );
          })()}
        </Grid>
      </Grid>
    </>
  );
}
