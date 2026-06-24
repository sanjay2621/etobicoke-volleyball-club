import { useEffect, useMemo, useRef, useState } from 'react';
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
  Tooltip,
  Typography,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { useActiveTournaments } from '../../api/tournaments';
import { useDeletePlayer, usePlayers, useUploadPlayerPhoto } from '../../api/players';
import { useTeams } from '../../api/teams';
import { downloadFile } from '../../api/client';
import type { Player } from '../../types';
import { PlayerEditDialog } from './PlayerEditDialog';
import styles from './RefereesPage.module.css';

export function RefereesPage() {
  const { data: tournaments } = useActiveTournaments();
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const { data: players, isLoading } = usePlayers(tournamentId);
  const { data: teams } = useTeams(tournamentId);
  const del = useDeletePlayer();
  const uploadPhoto = useUploadPlayerPhoto();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
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
            className={styles.searchField}
          />
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
                  <Box className={styles.emptyCell}>
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
                  className={assignedTeam ? styles.assignedRow : ''}
                >
                  <TableCell>
                    <Box className={styles.avatarWrapper}>
                      <Avatar
                        src={p.photoUrl ?? undefined}
                        className={p.photoUrl ? styles.avatarClickable : styles.avatar}
                        onClick={() => p.photoUrl && setPreviewUrl(p.photoUrl)}
                      />
                      <Tooltip title="Upload photo">
                        <IconButton
                          size="small"
                          className={styles.photoUploadBtn}
                          onClick={() => { setUploadingId(p.id); photoInputRef.current?.click(); }}
                        >
                          <AddPhotoAlternateIcon className={styles.photoUploadIcon} />
                        </IconButton>
                      </Tooltip>
                    </Box>
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

      <input
        type="file"
        accept="image/*"
        hidden
        ref={photoInputRef}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && uploadingId != null) await uploadPhoto.mutateAsync({ id: uploadingId, photo: file });
          e.target.value = '';
          setUploadingId(null);
        }}
      />

      <PlayerEditDialog player={editing} onClose={() => setEditing(null)} />

      <Dialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} maxWidth="sm" fullWidth>
        <Box className={styles.photoPreviewBox}>
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
