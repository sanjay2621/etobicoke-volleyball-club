import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useBuildPlayoffs } from '../../api/schedule';
import type { PlayoffMatchRequest, PlayoffStage, StandingGroup } from '../../types';

const STAGES: PlayoffStage[] = ['QUARTERFINAL', 'SEMIFINAL', 'FINAL', 'BRONZE'];

let keySeq = 0;
function nextKey() {
  keySeq += 1;
  return `m${keySeq}`;
}

type MatchDraft = {
  key: string;
  stage: PlayoffStage;
  slot: string;
  home: string; // 'team:<id>' or 'W:<slot>' or 'L:<slot>' or ''
  away: string;
};

function stageForRound(roundIndex: number, totalRounds: number, matchIndexInRound: number): PlayoffStage {
  const roundsFromEnd = totalRounds - 1 - roundIndex;
  if (roundsFromEnd === 0) return matchIndexInRound === 0 ? 'FINAL' : 'BRONZE';
  if (roundsFromEnd === 1) return 'SEMIFINAL';
  return 'QUARTERFINAL';
}

function parseOption(value: string): { teamId: number | null; source: string | null } {
  if (value.startsWith('team:')) {
    return { teamId: Number(value.slice(5)), source: null };
  }
  if (value.startsWith('W:') || value.startsWith('L:')) {
    return { teamId: null, source: value };
  }
  return { teamId: null, source: null };
}

export function PlayoffBuilderDialog({
  tournamentId,
  standings,
  open,
  onClose,
}: {
  tournamentId: number | null;
  standings: StandingGroup[] | undefined;
  open: boolean;
  onClose: () => void;
}) {
  const build = useBuildPlayoffs();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [rounds, setRounds] = useState<MatchDraft[][]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setRounds([]);
      setError(null);
    }
  }, [open]);

  const allTeams = useMemo(
    () => (standings ?? []).flatMap((g) => g.rows.map((r) => ({ id: r.teamId, name: r.teamName, group: g.groupLabel, rank: r.rank }))),
    [standings],
  );
  const advancingTeams = useMemo(() => allTeams.filter((t) => selectedIds.has(t.id)), [allTeams, selectedIds]);

  function toggleTeam(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function addRound() {
    setRounds((prev) => [...prev, []]);
  }

  function removeRound(roundIndex: number) {
    setRounds((prev) => prev.filter((_, i) => i !== roundIndex));
  }

  function addMatch(roundIndex: number) {
    setRounds((prev) => {
      const next = prev.map((r) => [...r]);
      const round = next[roundIndex];
      const stage = stageForRound(roundIndex, next.length, round.length);
      const prefix = stage === 'QUARTERFINAL' ? 'QF' : stage === 'SEMIFINAL' ? 'SF' : stage;
      const slot = stage === 'FINAL' || stage === 'BRONZE' ? stage : `${prefix}${round.length + 1}`;
      round.push({ key: nextKey(), stage, slot, home: '', away: '' });
      return next;
    });
  }

  function removeMatch(roundIndex: number, key: string) {
    setRounds((prev) => {
      const next = prev.map((r) => [...r]);
      next[roundIndex] = next[roundIndex].filter((m) => m.key !== key);
      return next;
    });
  }

  function updateMatch(roundIndex: number, key: string, patch: Partial<MatchDraft>) {
    setRounds((prev) => {
      const next = prev.map((r) => [...r]);
      next[roundIndex] = next[roundIndex].map((m) => (m.key === key ? { ...m, ...patch } : m));
      return next;
    });
  }

  // Options for a match in `roundIndex`: teams that haven't been used directly by an earlier round
  // (still eligible for a bye straight into a later round), plus winner/loser of every slot defined
  // in an earlier round.
  function optionsForRound(roundIndex: number) {
    const usedDirectly = new Set(
      rounds.slice(0, roundIndex).flatMap((r) => r.flatMap((m) => [m.home, m.away]))
        .filter((v) => v.startsWith('team:')),
    );
    const teamOptions = advancingTeams
      .filter((t) => !usedDirectly.has(`team:${t.id}`))
      .map((t) => ({ value: `team:${t.id}`, label: `${t.name} (${t.group}${t.rank})` }));
    const sourceOptions = rounds.slice(0, roundIndex).flatMap((r) =>
      r.filter((m) => m.slot).flatMap((m) => [
        { value: `W:${m.slot}`, label: `Winner of ${m.slot}` },
        { value: `L:${m.slot}`, label: `Loser of ${m.slot}` },
      ]),
    );
    return [...teamOptions, ...sourceOptions];
  }

  async function onSubmit() {
    if (!tournamentId) return;
    setError(null);
    const flat = rounds.flat();
    if (flat.length === 0) {
      setError('Add at least one match.');
      return;
    }
    const slots = new Set<string>();
    for (const m of flat) {
      if (!m.slot.trim()) {
        setError('Every match needs a slot name.');
        return;
      }
      if (slots.has(m.slot)) {
        setError(`Duplicate slot: ${m.slot}`);
        return;
      }
      slots.add(m.slot);
      if (!m.home || !m.away) {
        setError(`Match ${m.slot} needs both a home and away side.`);
        return;
      }
    }
    const built: PlayoffMatchRequest[] = flat.map((m) => {
      const home = parseOption(m.home);
      const away = parseOption(m.away);
      return {
        stage: m.stage,
        slot: m.slot.trim(),
        homeTeamId: home.teamId,
        homeSource: home.source,
        awayTeamId: away.teamId,
        awaySource: away.source,
      };
    });
    try {
      await build.mutateAsync({ tournamentId, matches: built });
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Could not build the bracket');
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Build playoff bracket</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          1. Select advancing teams
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={2} mb={3}>
          {(standings ?? []).map((g) => (
            <Paper key={g.groupLabel} variant="outlined" sx={{ p: 1.5, minWidth: 200 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Group {g.groupLabel}</Typography>
              {g.rows.map((r) => (
                <Stack key={r.teamId} direction="row" alignItems="center" spacing={1}>
                  <Checkbox
                    size="small"
                    checked={selectedIds.has(r.teamId)}
                    onChange={() => toggleTeam(r.teamId)}
                  />
                  <Typography variant="body2">#{r.rank} {r.teamName}</Typography>
                </Stack>
              ))}
            </Paper>
          ))}
          {(!standings || standings.length === 0) && (
            <Typography color="text.secondary">No standings yet — generate and complete pools first.</Typography>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          2. Arrange the bracket
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Build round by round — first round pairs the teams you selected above directly; later rounds
          pair the winner/loser of an earlier round's match.
        </Typography>

        <Stack spacing={2} mt={1}>
          {rounds.map((round, roundIndex) => (
            <Paper key={roundIndex} variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" fontWeight={700}>Round {roundIndex + 1}</Typography>
                <IconButton size="small" onClick={() => removeRound(roundIndex)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Stack spacing={1.5}>
                {round.map((m) => {
                  const options = optionsForRound(roundIndex);
                  return (
                    <Stack key={m.key} direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <TextField
                        select
                        size="small"
                        label="Stage"
                        value={m.stage}
                        onChange={(e) => updateMatch(roundIndex, m.key, { stage: e.target.value as PlayoffStage })}
                        sx={{ minWidth: 130 }}
                      >
                        {STAGES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </TextField>
                      <TextField
                        size="small"
                        label="Slot"
                        value={m.slot}
                        onChange={(e) => updateMatch(roundIndex, m.key, { slot: e.target.value.toUpperCase().slice(0, 12) })}
                        sx={{ width: 100 }}
                      />
                      <TextField
                        select
                        size="small"
                        label="Home"
                        value={m.home}
                        onChange={(e) => updateMatch(roundIndex, m.key, { home: e.target.value })}
                        sx={{ minWidth: 220 }}
                      >
                        {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                      </TextField>
                      <TextField
                        select
                        size="small"
                        label="Away"
                        value={m.away}
                        onChange={(e) => updateMatch(roundIndex, m.key, { away: e.target.value })}
                        sx={{ minWidth: 220 }}
                      >
                        {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                      </TextField>
                      <IconButton size="small" onClick={() => removeMatch(roundIndex, m.key)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  );
                })}
                <Button size="small" startIcon={<AddIcon />} onClick={() => addMatch(roundIndex)} sx={{ alignSelf: 'flex-start' }}>
                  Add match
                </Button>
              </Stack>
            </Paper>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addRound}
            disabled={advancingTeams.length === 0}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add round
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={build.isPending}>
          {build.isPending ? 'Building…' : 'Build bracket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
