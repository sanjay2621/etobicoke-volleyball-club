import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { MatchResponse, MatchSetDto } from '../../types';
import { useRecordResult } from '../../api/schedule';

export function ResultDialog({
  match,
  onClose,
}: {
  match: MatchResponse | null;
  onClose: () => void;
}) {
  const record = useRecordResult();
  const [sets, setSets] = useState<MatchSetDto[]>([{ setNumber: 1, homePoints: 0, awayPoints: 0 }]);

  useEffect(() => {
    if (match) {
      setSets(
        match.sets.length > 0
          ? match.sets.map((s) => ({ ...s }))
          : [{ setNumber: 1, homePoints: 0, awayPoints: 0 }],
      );
    }
  }, [match]);

  if (!match) return null;

  const update = (i: number, patch: Partial<MatchSetDto>) =>
    setSets(sets.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const addSet = () =>
    setSets([...sets, { setNumber: sets.length + 1, homePoints: 0, awayPoints: 0 }]);

  const removeSet = (i: number) =>
    setSets(sets.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, setNumber: idx + 1 })));

  async function onSave() {
    await record.mutateAsync({ matchId: match!.id, sets });
    onClose();
  }

  return (
    <Dialog open={!!match} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Enter result</DialogTitle>
      <DialogContent>
        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Typography fontWeight={700}>{match.homeTeamName ?? 'Home'}</Typography>
          <Typography color="text.secondary">vs</Typography>
          <Typography fontWeight={700}>{match.awayTeamName ?? 'Away'}</Typography>
        </Stack>
        {sets.map((s, i) => (
          <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography sx={{ width: 48 }}>Set {s.setNumber}</Typography>
            <TextField
              size="small"
              type="number"
              label="Home"
              value={s.homePoints}
              onChange={(e) => update(i, { homePoints: Number(e.target.value) })}
            />
            <TextField
              size="small"
              type="number"
              label="Away"
              value={s.awayPoints}
              onChange={(e) => update(i, { awayPoints: Number(e.target.value) })}
            />
            {sets.length > 1 && (
              <IconButton size="small" onClick={() => removeSet(i)} aria-label="remove set">
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        ))}
        <Box>
          <Button size="small" startIcon={<AddIcon />} onClick={addSet}>
            Add set
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSave} disabled={record.isPending}>
          Save result
        </Button>
      </DialogActions>
    </Dialog>
  );
}
