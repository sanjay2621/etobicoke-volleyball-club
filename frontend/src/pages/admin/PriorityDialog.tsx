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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { Player } from '../../types';
import { useSetDraftPriority } from '../../api/players';

type ResultStatus = 'pending' | 'success' | 'error';
type Result = { player: Player; status: ResultStatus; message?: string };

export function PriorityDialog({
  players,
  action,
  onClose,
}: {
  players: Player[];
  action: 'MARK' | 'UNMARK' | null;
  onClose: () => void;
}) {
  const setDraftPriority = useSetDraftPriority();
  const [results, setResults] = useState<Result[] | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setResults(null);
    setRunning(false);
  }, [players, action]);

  if (!action || players.length === 0) return null;

  const verb = action === 'MARK' ? 'Mark' : 'Unmark';
  const label = players.length === 1
    ? `${verb} ${players[0].fullName} as priority?`
    : `${verb} ${players.length} players as priority?`;

  async function onConfirm() {
    setRunning(true);
    const initial: Result[] = players.map((p) => ({ player: p, status: 'pending' }));
    setResults(initial);
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      try {
        await setDraftPriority.mutateAsync({ id: p.id, priority: action === 'MARK' });
        setResults((prev) => prev!.map((r, idx) => (idx === i ? { ...r, status: 'success' } : r)));
      } catch (err: any) {
        const message = err?.response?.data?.message ?? `${verb} failed`;
        setResults((prev) => prev!.map((r, idx) => (idx === i ? { ...r, status: 'error', message } : r)));
      }
    }
    setRunning(false);
  }

  return (
    <Dialog open={!!action && players.length > 0} onClose={running ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{label}</DialogTitle>
      <DialogContent>
        {results && (
          <Box>
            <List dense>
              {results.map((r) => (
                <ListItem key={r.player.id} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {r.status === 'success' && <CheckCircleIcon color="success" fontSize="small" />}
                    {r.status === 'error' && <ErrorIcon color="error" fontSize="small" />}
                    {r.status === 'pending' && <Box component="span">…</Box>}
                  </ListItemIcon>
                  <ListItemText
                    primary={r.player.fullName}
                    secondary={r.status === 'error' ? r.message : undefined}
                  />
                </ListItem>
              ))}
            </List>
            {!running && results.some((r) => r.status === 'error') && (
              <Alert severity="warning">Some players couldn't be updated — see details above.</Alert>
            )}
            {!running && results.every((r) => r.status === 'success') && (
              <Alert severity="success">Done.</Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!results && <Button onClick={onClose}>Cancel</Button>}
        {!results && (
          <Button variant="contained" onClick={onConfirm}>
            {verb}
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
