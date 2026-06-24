import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SportsIcon from '@mui/icons-material/Sports';
import { useActiveTournaments } from '../../api/tournaments';
import { downloadFile } from '../../api/client';
import { usePlayers } from '../../api/players';
import {
  useAddMember,
  useCreateTeam,
  useDeleteTeam,
  useRemoveMember,
  useSetCaptain,
  useSetReferee,
  useTeams,
} from '../../api/teams';
import type { Player, Team } from '../../types';
import styles from './TeamsPage.module.css';

export function TeamsPage() {
  const { data: tournaments } = useActiveTournaments();
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const { data: teams } = useTeams(tournamentId);
  const { data: players } = usePlayers(tournamentId);
  const createTeam = useCreateTeam();
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newError, setNewError] = useState<string | null>(null);

  useEffect(() => {
    if (tournamentId == null && tournaments && tournaments.length > 0) {
      setTournamentId(tournaments[0].id);
    }
  }, [tournaments, tournamentId]);

  const assignedIds = useMemo(() => {
    const set = new Set<number>();
    teams?.forEach((t) => t.members.forEach((m) => set.add(m.playerId)));
    return set;
  }, [teams]);

  const availablePlayers = useMemo(
    () => players?.filter((p) => !assignedIds.has(p.id) && !p.preferredPositions.includes('REFEREE')) ?? [],
    [players, assignedIds],
  );

  async function onCreate() {
    if (!tournamentId || !newName.trim()) return;
    setNewError(null);
    try {
      await createTeam.mutateAsync({ tournamentId, name: newName.trim() });
      setNewName('');
      setNewOpen(false);
    } catch (err: any) {
      setNewError(err?.response?.data?.message ?? 'Failed to create team');
    }
  }

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Teams</Typography>
        <Stack direction="row" spacing={2}>
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
            startIcon={<DownloadIcon />}
            disabled={!tournamentId}
            onClick={() =>
              tournamentId &&
              downloadFile(`/teams/export?tournamentId=${tournamentId}`, `teams-${tournamentId}.csv`)
            }
          >
            CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNewOpen(true)}>
            New team
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {teams?.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary">No teams yet. Create one to start building rosters.</Typography>
          </Grid>
        )}
        {teams?.map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.id}>
            <TeamCard team={team} available={availablePlayers} allPlayers={players ?? []} />
          </Grid>
        ))}
      </Grid>

      <Dialog open={newOpen} onClose={() => { setNewOpen(false); setNewError(null); setNewName(''); }}>
        <DialogTitle>New team</DialogTitle>
        <DialogContent>
          {newError && (
            <Alert severity="error" className={styles.newTeamAlert}>
              {newError}
            </Alert>
          )}
          <TextField
            autoFocus
            label="Team name"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setNewError(null); }}
            onKeyDown={(e) => e.key === 'Enter' && onCreate()}
            className={styles.newTeamField}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setNewOpen(false); setNewError(null); setNewName(''); }}>Cancel</Button>
          <Button variant="contained" onClick={onCreate} disabled={!newName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function TeamCard({
  team,
  available,
  allPlayers,
}: {
  team: Team;
  available: Player[];
  allPlayers: Player[];
}) {
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const setCaptain = useSetCaptain();
  const setReferee = useSetReferee();
  const deleteTeam = useDeleteTeam();
  const [toAdd, setToAdd] = useState<Player | null>(null);

  const refereeName = team.refereePlayerId
    ? allPlayers.find((p) => p.id === team.refereePlayerId)?.fullName ?? `#${team.refereePlayerId}`
    : null;

  // Only players who registered as a referee (picked the REFEREE position) can be assigned.
  const refereeOptions = useMemo(
    () => allPlayers.filter((p) => p.preferredPositions.includes('REFEREE')),
    [allPlayers],
  );

  return (
    <Card className={styles.teamCard}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{team.name}</Typography>
          <Box>
            {team.groupLabel && <Chip size="small" label={`Group ${team.groupLabel}`} className={styles.groupChip} />}
            <Chip size="small" label={`${team.memberCount} players`} />
            <IconButton
              size="small"
              color="error"
              aria-label="delete team"
              onClick={() => {
                if (confirm(`Delete team "${team.name}"?`)) deleteTeam.mutate(team.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>

        <Box className={styles.membersBox}>
          {team.members.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No players yet.
            </Typography>
          )}
          {team.members.map((m) => (
            <ListItem
              key={m.playerId}
              disableGutters
              secondaryAction={
                <Box>
                  <Tooltip title={m.captain ? 'Captain' : 'Make captain'}>
                    <IconButton
                      size="small"
                      onClick={() => setCaptain.mutate({ teamId: team.id, playerId: m.playerId })}
                    >
                      {m.captain ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size="small"
                    aria-label="remove"
                    onClick={() => removeMember.mutate({ teamId: team.id, playerId: m.playerId })}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar src={m.photoUrl ?? undefined} className={styles.memberAvatar} />
              </ListItemAvatar>
              <ListItemText
                primary={m.fullName}
                secondary={m.preferredPositions.join(', ')}
              />
            </ListItem>
          ))}
        </Box>

        <Stack direction="row" spacing={1} className={styles.addPlayerRow}>
          <Autocomplete
            size="small"
            className={styles.autocompleteGrow}
            options={available}
            value={toAdd}
            onChange={(_, v) => setToAdd(v)}
            getOptionLabel={(p) => p.fullName}
            renderOption={({ key, ...props }, p) => (
              <Box key={key} component="li" {...props} className={styles.playerOption}>
                <Avatar src={p.photoUrl ?? undefined} className={styles.playerOptionAvatar} />
                {p.fullName}
              </Box>
            )}
            renderInput={(params) => <TextField {...params} label="Add player" />}
          />
          <Button
            variant="outlined"
            disabled={!toAdd}
            onClick={async () => {
              if (toAdd) {
                await addMember.mutateAsync({ teamId: team.id, playerId: toAdd.id });
                setToAdd(null);
              }
            }}
          >
            Add
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" className={styles.refereeSection}>
          <SportsIcon fontSize="small" color="action" />
          <Autocomplete
            size="small"
            className={styles.autocompleteGrow}
            options={refereeOptions}
            value={allPlayers.find((p) => p.id === team.refereePlayerId) ?? null}
            onChange={(_, v) => setReferee.mutate({ teamId: team.id, playerId: v ? v.id : 0 })}
            getOptionLabel={(p) => p.fullName}
            noOptionsText="No registered referees"
            renderInput={(params) => (
              <TextField {...params} label={refereeName ? 'Referee' : 'Assign referee'} />
            )}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
