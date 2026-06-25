import { useEffect, useMemo, useState } from 'react';
import {
  Box,
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
import CheckroomIcon from '@mui/icons-material/Checkroom';
import { useActiveTournaments } from '../../api/tournaments';
import { usePlayers } from '../../api/players';
import { useTeams } from '../../api/teams';
import { TSHIRT_SIZES } from '../../types';
import styles from './TshirtPage.module.css';

export function TshirtPage() {
  const { data: tournaments } = useActiveTournaments();
  const [tournamentId, setTournamentId] = useState<number | null>(null);

  useEffect(() => {
    if (tournamentId == null && tournaments?.length) {
      setTournamentId(tournaments[0].id);
    }
  }, [tournaments, tournamentId]);

  const { data: players } = usePlayers(tournamentId);
  const { data: teams } = useTeams(tournamentId);

  const rows = useMemo(() => {
    if (!players || !teams) return [];
    const sizeMap = new Map(players.map((p) => [p.id, p.tshirtSize]));

    return teams.map((team) => {
      const counts: Record<string, number> = {};
      for (const sz of TSHIRT_SIZES) counts[sz] = 0;

      for (const m of team.members) {
        const sz = sizeMap.get(m.playerId);
        if (sz) counts[sz]++;
      }

      // Referee may not be a roster member — count them separately if so
      if (team.refereePlayerId) {
        const memberIds = new Set(team.members.map((m) => m.playerId));
        if (!memberIds.has(team.refereePlayerId)) {
          const sz = sizeMap.get(team.refereePlayerId);
          if (sz) counts[sz]++;
        }
      }

      const total = TSHIRT_SIZES.reduce((s, sz) => s + counts[sz], 0);
      return { teamName: team.name, counts, total };
    });
  }, [players, teams]);

  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    for (const sz of TSHIRT_SIZES) t[sz] = 0;
    for (const row of rows) {
      for (const sz of TSHIRT_SIZES) t[sz] += row.counts[sz];
    }
    return t;
  }, [rows]);

  const grandTotal = TSHIRT_SIZES.reduce((s, sz) => s + (totals[sz] ?? 0), 0);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckroomIcon />
          <Typography variant="h4">T-Shirt Sizes</Typography>
        </Stack>
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
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow className={styles.headerRow}>
              <TableCell>Team</TableCell>
              {TSHIRT_SIZES.map((sz) => (
                <TableCell key={sz} align="center">
                  {sz}
                </TableCell>
              ))}
              <TableCell align="center">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.teamName} hover>
                <TableCell>{row.teamName}</TableCell>
                {TSHIRT_SIZES.map((sz) => (
                  <TableCell key={sz} align="center">
                    {row.counts[sz] > 0 ? row.counts[sz] : '—'}
                  </TableCell>
                ))}
                <TableCell align="center" className={styles.totalCell}>
                  {row.total}
                </TableCell>
              </TableRow>
            ))}
            {rows.length > 0 && (
              <TableRow className={styles.totalRow}>
                <TableCell className={styles.totalCell}>Total</TableCell>
                {TSHIRT_SIZES.map((sz) => (
                  <TableCell key={sz} align="center" className={styles.totalCell}>
                    {totals[sz] > 0 ? totals[sz] : '—'}
                  </TableCell>
                ))}
                <TableCell align="center" className={styles.totalCell}>
                  {grandTotal}
                </TableCell>
              </TableRow>
            )}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={TSHIRT_SIZES.length + 2}>
                  <Box className={styles.emptyCell}>No teams found for this tournament.</Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
