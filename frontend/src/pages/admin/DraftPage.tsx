import { useEffect, useState } from 'react';
import { TruncatedText } from '../../components/TruncatedText';
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
  const [assignTeamId, setAssignTeamId] = useState<number | ''>('');

  useEffect(() => {
    if (tournamentId == null && tournaments && tournaments.length > 0) {
      setTournamentId(tournaments[0].id);
    }
  }, [tournaments, tournamentId]);

  useEffect(() => {
    if (draft && (assignTeamId === '' || !draft.teams.some((t) => t.id === assignTeamId))) {
      setAssignTeamId(draft.teams[0]?.id ?? '');
    }
  }, [draft, assignTeamId]);

  async function onStart() {
    if (!tournamentId) return;
    setError(null);
    try {
      await start.mutateAsync(tournamentId);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Could not start the draft');
    }
  }

  async function onPick(playerId: number) {
    if (!tournamentId || !assignTeamId) return;
    setError(null);
    try {
      await pick.mutateAsync({ tournamentId, playerId, teamId: assignTeamId });
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
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h6">Draft in progress</Typography>
              <TextField
                select
                size="small"
                label="Assign picks to"
                value={assignTeamId}
                onChange={(e) => setAssignTeamId(Number(e.target.value))}
                className={styles.tournamentSelect}
              >
                {draft.teams.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name} ({t.memberCount})
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
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
            {draft?.teams.map((team) => (
              <Grid item xs={12} sm={6} key={team.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                        <TruncatedText text={team.name} />
                      </Typography>
                      <Chip size="small" label={`${team.memberCount}`} />
                    </Stack>
                    <List dense>
                      {team.members.map((m) => (
                        <ListItem key={m.playerId} disableGutters>
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <TruncatedText text={m.fullName} />
                                </Box>
                                {m.captain && <StarIcon fontSize="inherit" color="warning" />}
                              </Stack>
                            }
                            sx={{ minWidth: 0 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={5}>
          {(() => {
            const draftable = draft?.availablePlayers.filter((p) => !p.preferredPositions.includes('REFEREE')) ?? [];
            const priorityPlayers = draftable.filter((p) => p.draftPriority);
            const remainingPlayers = draftable.filter((p) => !p.draftPriority);
            const priorityPending = priorityPlayers.length > 0;

            const renderList = (list: typeof draftable, disabledHint?: string) => (
              <Paper variant="outlined" className={styles.availableList}>
                <List dense>
                  {list.map((p) => (
                    <ListItem
                      key={p.id}
                      secondaryAction={
                        <Button
                          size="small"
                          variant="contained"
                          disabled={!inProgress || !assignTeamId || pick.isPending || !!disabledHint}
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
                        primary={<TruncatedText text={p.fullName} />}
                        secondary={<TruncatedText text={`${p.preferredPositions.join(', ')}${p.skillLevel ? ' · ' + p.skillLevel : ''}`} />}
                        sx={{ minWidth: 0 }}
                      />
                    </ListItem>
                  ))}
                  {list.length === 0 && (
                    <ListItem>
                      <ListItemText primary="None." />
                    </ListItem>
                  )}
                </List>
              </Paper>
            );

            return (
              <>
                <Typography variant="h6" gutterBottom>
                  Priority players ({priorityPlayers.length})
                </Typography>
                {renderList(priorityPlayers)}

                <Typography variant="h6" gutterBottom mt={2}>
                  Remaining players ({remainingPlayers.length})
                </Typography>
                {priorityPending && (
                  <Alert severity="info" className={styles.errorAlert}>
                    Draft all priority players first.
                  </Alert>
                )}
                {renderList(remainingPlayers, priorityPending ? 'Draft priority players first' : undefined)}
              </>
            );
          })()}
        </Grid>
      </Grid>
    </>
  );
}
