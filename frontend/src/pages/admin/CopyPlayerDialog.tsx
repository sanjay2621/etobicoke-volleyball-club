import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import type { Player } from '../../types';
import { useActiveTournaments } from '../../api/tournaments';
import { useCopyPlayerToTournament } from '../../api/players';

export function CopyPlayerDialog({
  player,
  onClose,
}: {
  player: Player | null;
  onClose: () => void;
}) {
  const { data: tournaments } = useActiveTournaments();
  const copyPlayer = useCopyPlayerToTournament();
  const [targetId, setTargetId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTargetId('');
    setError(null);
  }, [player]);

  if (!player) return null;

  const options = (tournaments ?? []).filter((t) => t.id !== player.tournamentId);

  async function onConfirm() {
    if (!targetId) return;
    setError(null);
    try {
      await copyPlayer.mutateAsync({ id: player!.id, targetTournamentId: Number(targetId) });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not copy this player. Please try again.');
    }
  }

  return (
    <Dialog open={!!player} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Copy {player.fullName} to another tournament</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm} disabled={!targetId || copyPlayer.isPending}>
          Copy
        </Button>
      </DialogActions>
    </Dialog>
  );
}
