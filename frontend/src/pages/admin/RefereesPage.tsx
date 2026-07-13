import { useEffect, useMemo, useRef, useState } from 'react';
import { TruncatedText } from '../../components/TruncatedText';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
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
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
import { CopyPlayerDialog } from './CopyPlayerDialog';
import { ApprovalDialog } from './ApprovalDialog';
import styles from './RefereesPage.module.css';

const approvalColor: Record<Player['approvalStatus'], 'success' | 'error' | 'warning'> = {
  APPROVED: 'success',
  REJECTED: 'error',
  PENDING: 'warning',
};

export function RefereesPage() {
  const { data: tournaments } = useActiveTournaments();
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const { data: players, isLoading, isError, refetch } = usePlayers(tournamentId);
  const { data: teams } = useTeams(tournamentId);
  const del = useDeletePlayer();
  const uploadPhoto = useUploadPlayerPhoto();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Player | null>(null);
  const [copying, setCopying] = useState<Player[]>([]);
  const [approving, setApproving] = useState<{ players: Player[]; action: 'APPROVED' | 'REJECTED' | null }>({ players: [], action: null });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'firstName' | 'lastName' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(field: 'firstName' | 'lastName') {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

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

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortField].toLowerCase();
      const vb = b[sortField].toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [tournamentId]);

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => (prev.size === sorted.length ? new Set() : new Set(sorted.map((p) => p.id))));
  }

  const selectedPlayers = sorted.filter((p) => selectedIds.has(p.id));

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
            color="success"
            startIcon={<CheckCircleIcon />}
            disabled={selectedPlayers.length === 0}
            onClick={() => setApproving({ players: selectedPlayers, action: 'APPROVED' })}
          >
            Approve selected{selectedPlayers.length > 0 ? ` (${selectedPlayers.length})` : ''}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            disabled={selectedPlayers.length === 0}
            onClick={() => setApproving({ players: selectedPlayers, action: 'REJECTED' })}
          >
            Reject selected{selectedPlayers.length > 0 ? ` (${selectedPlayers.length})` : ''}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            disabled={selectedPlayers.length === 0}
            onClick={() => setCopying(selectedPlayers)}
          >
            Copy selected{selectedPlayers.length > 0 ? ` (${selectedPlayers.length})` : ''}
          </Button>
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
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedIds.size > 0 && selectedIds.size < sorted.length}
                  checked={sorted.length > 0 && selectedIds.size === sorted.length}
                  onChange={toggleSelectAll}
                />
              </TableCell>
              <TableCell />
              <TableCell sortDirection={sortField === 'firstName' ? sortDir : false}>
                <TableSortLabel
                  active={sortField === 'firstName'}
                  direction={sortField === 'firstName' ? sortDir : 'asc'}
                  onClick={() => handleSort('firstName')}
                >
                  First Name
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'lastName' ? sortDir : false}>
                <TableSortLabel
                  active={sortField === 'lastName'}
                  direction={sortField === 'lastName' ? sortDir : 'asc'}
                  onClick={() => handleSort('lastName')}
                >
                  Last Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Skill</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Approval</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Assigned Team</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={12}>Loading…</TableCell>
              </TableRow>
            )}
            {!isLoading && isError && (
              <TableRow>
                <TableCell colSpan={12}>
                  <Box className={styles.emptyCell}>
                    Couldn't load referees — the server may still be waking up.{' '}
                    <Button size="small" onClick={() => refetch()}>Retry</Button>
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={12}>
                  <Box className={styles.emptyCell}>
                    {search
                      ? 'No referees match your search.'
                      : 'No players have registered as referee for this tournament.'}
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {sorted.map((p) => {
              const assignedTeam = refereeTeamMap.get(p.id);
              return (
                <TableRow
                  key={p.id}
                  hover
                  selected={selectedIds.has(p.id)}
                  className={assignedTeam ? styles.assignedRow : ''}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedIds.has(p.id)} onChange={() => toggleSelected(p.id)} />
                  </TableCell>
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
                  <TableCell sx={{ maxWidth: 120 }}><TruncatedText text={p.firstName} /></TableCell>
                  <TableCell sx={{ maxWidth: 120 }}><TruncatedText text={p.lastName} /></TableCell>
                  <TableCell>{p.skillLevel ?? '—'}</TableCell>
                  <TableCell sx={{ maxWidth: 130 }}><TruncatedText text={p.phone} /></TableCell>
                  <TableCell sx={{ maxWidth: 200 }}><TruncatedText text={p.email} /></TableCell>
                  <TableCell>
                    <Chip
                      label={p.paymentStatus}
                      size="small"
                      color={p.paymentStatus === 'PAID' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={p.approvalStatus === 'REJECTED' && p.rejectionReason ? p.rejectionReason : ''}>
                      <Chip
                        label={p.approvalStatus === 'APPROVED' ? 'Approved' : p.approvalStatus === 'REJECTED' ? 'Rejected' : 'Pending'}
                        size="small"
                        color={approvalColor[p.approvalStatus]}
                      />
                    </Tooltip>
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
                    {p.approvalStatus !== 'APPROVED' && (
                      <Tooltip title="Approve">
                        <IconButton size="small" color="success" aria-label="approve"
                          onClick={() => setApproving({ players: [p], action: 'APPROVED' })}>
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {p.approvalStatus !== 'REJECTED' && (
                      <Tooltip title="Reject">
                        <IconButton size="small" color="error" aria-label="reject"
                          onClick={() => setApproving({ players: [p], action: 'REJECTED' })}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Copy to another tournament">
                      <IconButton size="small" aria-label="copy" onClick={() => setCopying([p])}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
      <CopyPlayerDialog
        players={copying}
        onClose={() => {
          setCopying([]);
          setSelectedIds(new Set());
        }}
      />
      <ApprovalDialog
        players={approving.players}
        action={approving.action}
        onClose={() => {
          setApproving({ players: [], action: null });
          setSelectedIds(new Set());
        }}
      />

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
