import { useEffect, useMemo } from 'react';
import { TruncatedText } from '../../components/TruncatedText';
import {
  Box,
  MenuItem,
  Paper,
  Select,
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
import { useSetTshirtColor } from '../../api/teams';
import { TSHIRT_COLORS, TSHIRT_SIZES } from '../../types';
import { useState } from 'react';
import styles from './TshirtPage.module.css';

function ColorSwatch({ hex, size = 14 }: { hex: string; size?: number }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: hex,
        border: '1px solid rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    />
  );
}

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
  const setColor = useSetTshirtColor();

  const colorMap = useMemo(
    () => new Map(TSHIRT_COLORS.map((c) => [c.label, c.hex])),
    [],
  );

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

      if (team.refereePlayerId) {
        const memberIds = new Set(team.members.map((m) => m.playerId));
        if (!memberIds.has(team.refereePlayerId)) {
          const sz = sizeMap.get(team.refereePlayerId);
          if (sz) counts[sz]++;
        }
      }

      const total = TSHIRT_SIZES.reduce((s, sz) => s + counts[sz], 0);
      return { teamId: team.id, teamName: team.name, tshirtColor: team.tshirtColor ?? '', counts, total };
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
              <TableCell sx={{ minWidth: 170 }}>T-Shirt Color</TableCell>
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
                <TableCell sx={{ maxWidth: 180 }}><TruncatedText text={row.teamName} /></TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  <Select
                    size="small"
                    displayEmpty
                    value={row.tshirtColor}
                    onChange={(e) =>
                      setColor.mutate({ teamId: row.teamId, color: e.target.value || null })
                    }
                    renderValue={(val) => {
                      if (!val) return <Typography variant="body2" color="text.disabled">— pick color —</Typography>;
                      const hex = colorMap.get(val as string);
                      return (
                        <Stack direction="row" spacing={1} alignItems="center">
                          {hex && <ColorSwatch hex={hex} />}
                          <Typography variant="body2">{val as string}</Typography>
                        </Stack>
                      );
                    }}
                    sx={{ minWidth: 160, fontSize: '0.875rem' }}
                  >
                    <MenuItem value="">
                      <Typography variant="body2" color="text.secondary">— none —</Typography>
                    </MenuItem>
                    {TSHIRT_COLORS.map((c) => (
                      <MenuItem key={c.label} value={c.label}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ColorSwatch hex={c.hex} />
                          <span>{c.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
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
                <TableCell />
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
                <TableCell colSpan={TSHIRT_SIZES.length + 3}>
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