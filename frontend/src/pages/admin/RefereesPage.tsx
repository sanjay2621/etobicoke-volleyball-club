import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  IconButton,
  InputAdornment,
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
import { green } from '@mui/material/colors';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { useActiveTournaments } from '../../api/tournaments';
import { useDeletePlayer, usePlayers } from '../../api/players';
import { useTeams } from '../../api/teams';
import { downloadFile } from '../../api/client';
import type { Player } from '../../types';
import { PlayerEditDialog } from './PlayerEditDialog';

export function RefereesPage() {
  const { data: tournaments } = useActiveTournaments();
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const { data: players, isLoading } = usePlayers(tournamentId);
  const { data: teams } = useTeams(tournamentId);
  const del = useDeletePlayer();
  const [editing, setEditing] = useState<Player | null>(null);
  const [search, setSearch] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (tournamentId == null && tournaments && tournaments.length > 0) {
      setTournamentId(tournaments[0].id);
    }
  }, [tournaments, tournamentId]);

  // Map refereePlayerId → team name so we can show which team each referee is assigned to.
  const refereeTeamMap = useMemo(() => {
    const map = new Map<number, string>();
    teams?.forEach((t) => {
      if (t.refereePlayerId != null) map.set(t.refereePlayerId, t.name);
    });
    return map;
  }, [teams]);

  const referees = useMemo(
    () => (players ?? []).filter((p) => p.preferredPositions.includes('REFEREE')),
    [players],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return referees;
    return referees.filter((p) =>
      [p.fullName, p.email, p.phone, p.paymentStatus, p.skillLevel ?? '', p.preferredPositions.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [referees, search]);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h4">Referees</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Search name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 240 }}
          />
          <TextField
            select
            size="small"
            label="Tournament"
            value={tournamentId ?? ''}
            onChange={(e) => setTournamentId(Number(e.target.value))}
            sx={{ minWidth: 200 }}
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
              downloadFile(`/players/export?tournamentId=${tournamentId}`, `players-${tournamentId}.csv`)
            }
          >
            CSV
          </Button>
        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell>Skill</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Assigned Team</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9}>Loading…</TableCell>
              </TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box py={2} color="text.secondary">
                    {search
                      ? 'No referees match your search.'
                      : 'No players have registered as referee for this tournament.'}
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((p) => {
              const assignedTeam = refereeTeamMap.get(p.id);
              return (
                <TableRow
                  key={p.id}
                  hover
                  sx={{ bgcolor: assignedTeam ? green[50] : undefined }}
                >
                  <TableCell>
                    <Avatar
                      src={p.photoUrl ?? undefined}
                      sx={{ width: 32, height: 32, cursor: p.photoUrl ? 'pointer' : 'default' }}
                      onClick={() => p.photoUrl && setPreviewUrl(p.photoUrl)}
                    />
                  </TableCell>
                  <TableCell>{p.fullName}</TableCell>
                  <TableCell>{p.skillLevel ?? '—'}</TableCell>
                  <TableCell>{p.phone}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.paymentStatus}
                      size="small"
                      color={p.paymentStatus === 'PAID' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{p.hasAccount ? '✓' : '—'}</TableCell>
                  <TableCell>
                    {assignedTeam ? (
                      <Chip label={assignedTeam} size="small" color="success" variant="outlined" />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label="edit" onClick={() => setEditing(p)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="delete"
                      onClick={() => {
                        if (confirm(`Delete ${p.fullName}?`)) del.mutate(p.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <PlayerEditDialog player={editing} onClose={() => setEditing(null)} />

      <Dialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', bgcolor: 'black' }}>
          <img
            src={previewUrl ?? ''}
            alt="Referee photo"
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
          />
        </Box>
      </Dialog>
    </>
  );
}
