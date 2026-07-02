import { useState } from 'react';
import { TruncatedText } from '../../components/TruncatedText';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import styles from './TournamentsPage.module.css';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useDeleteTournament,
  useTournaments,
} from '../../api/tournaments';
import type { Tournament } from '../../types';
import { TournamentFormDialog } from './TournamentFormDialog';

export function TournamentsPage() {
  const { data: tournaments, isLoading } = useTournaments();
  const del = useDeleteTournament();
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [open, setOpen] = useState(false);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(t: Tournament) {
    setEditing(t);
    setOpen(true);
  }

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h4">Tournaments</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New tournament
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>Courts</TableCell>
              <TableCell>Reg. Deadline</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7}>Loading…</TableCell>
              </TableRow>
            )}
            {tournaments?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box className={styles.emptyCell}>
                    No tournaments yet. Create your first one.
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {tournaments?.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell sx={{ maxWidth: 200 }}><TruncatedText text={t.name} /></TableCell>
                <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                <TableCell>{t.startTime?.slice(0, 5)}</TableCell>
                <TableCell>{t.numberOfCourts}</TableCell>
                <TableCell>
                  {t.registrationDeadline
                    ? new Date(t.registrationDeadline).toLocaleDateString()
                    : '—'}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={t.status} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(t)} aria-label="edit">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="delete"
                    onClick={() => {
                      if (confirm(`Delete tournament "${t.name}"?`)) del.mutate(t.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TournamentFormDialog open={open} tournament={editing} onClose={() => setOpen(false)} />
    </>
  );
}
