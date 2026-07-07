import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { Player } from '../../types';
import { useActiveTournaments } from '../../api/tournaments';
import { useCopyPlayerToTournament } from '../../api/players';

type ResultStatus = 'pending' | 'success' | 'error';
type Result = { player: Player; status: ResultStatus; message?: string };

export function CopyPlayerDialog({
  players,
  onClose,
}: {
  players: Player[];
  onClose: () => void;
}) {
  const { data: tournaments } = useActiveTournaments();
  const copyPlayer = useCopyPlayerToTournament();
  const [targetId, setTargetId] = useState<number | ''>('');
  const [results, setResults] = useState<Result[] | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setTargetId('');
    setResults(null);
    setRunning(false);
  }, [players]);

  if (players.length === 0) return null;

  const options = (tournaments ?? []).filter((t) => t.id !== players[0].tournamentId);
  const label = players.length === 1
    ? `Copy ${players[0].fullName} to another tournament`
    : `Copy ${players.length} players to another tournament`;

  async function onConfirm() {
    if (!targetId) return;
    setRunning(true);
    const initial: Result[] = players.map((p) => ({ player: p, status: 'pending' }));
    setResults(initial);
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      try {
        await copyPlayer.mutateAsync({ id: p.id, targetTournamentId: Number(targetId) });
        setResults((prev) => prev!.map((r, idx) => (idx === i ? { ...r, status: 'success' } : r)));
      } catch (err: any) {
        const message = err?.response?.data?.message ?? 'Copy failed';
        setResults((prev) => prev!.map((r, idx) => (idx === i ? { ...r, status: 'error', message } : r)));
      }
    }
    setRunning(false);
  }

  return (
    <Dialog open={players.length > 0} onClose={running ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{label}</DialogTitle>
      <DialogContent>
        {!results && (
          <TextField
            select
            label="Target tournament"
            fullWidth
            value={targetId}
            onChange={(e) => setTargetId(Number(e.target.value))}
          >
            {options.length === 0 && (
              <MenuItem disabled value="">
                No other tournaments available
              </MenuItem>
            )}
            {options.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name} — {new Date(t.date).toLocaleDateString()}
              </MenuItem>
            ))}
          </TextField>
        )}
        {results && (
          <Box>
            <List dense>
              {results.map((r) => (
                <ListItem key={r.player.id} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {r.status === 'success' && <CheckCircleIcon color="success" fontSize="small" />}
                    {r.status === 'error' && <ErrorIcon color="error" fontSize="small" />}
                    {r.status === 'pending' && <Typography variant="caption">…</Typography>}
                  </ListItemIcon>
                  <ListItemText
                    primary={r.player.fullName}
                    secondary={r.status === 'error' ? r.message : undefined}
                  />
                </ListItem>
              ))}
            </List>
            {!running && results.some((r) => r.status === 'error') && (
              <Alert severity="warning">Some players couldn't be copied — see details above.</Alert>
            )}
            {!running && results.every((r) => r.status === 'success') && (
              <Alert severity="success">All players copied successfully.</Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!results && <Button onClick={onClose}>Cancel</Button>}
        {!results && (
          <Button variant="contained" onClick={onConfirm} disabled={!targetId}>
            Copy
          </Button>
        )}
        {results && (
          <Button variant="contained" onClick={onClose} disabled={running}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
