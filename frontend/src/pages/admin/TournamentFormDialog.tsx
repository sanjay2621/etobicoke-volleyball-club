import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  useCreateTournament,
  useUpdateTournament,
} from '../../api/tournaments';
import type { Tournament, TournamentStatus } from '../../types';

const STATUSES: TournamentStatus[] = [
  'SETUP',
  'REGISTRATION',
  'DRAFT',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETE',
];

const schema = z.object({
  name: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  startTime: z.string().min(1, 'Required'),
  registrationDeadline: z.string().optional(),
  venue: z.string().optional(),
  numberOfCourts: z.coerce.number().int().min(1).max(50),
  breakMinutes: z.coerce.number().int().min(0).max(60),
  poolMatchDurationMinutes: z.coerce.number().int().min(5).max(120),
  poolPointsPerSet: z.coerce.number().int().min(1).max(99),
  targetRosterSize: z.coerce.number().int().min(2).max(20),
  status: z.enum(['SETUP', 'REGISTRATION', 'DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETE']),
});

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  name: '',
  date: '',
  startTime: '08:00',
  registrationDeadline: '',
  venue: '',
  numberOfCourts: 4,
  breakMinutes: 10,
  poolMatchDurationMinutes: 20,
  poolPointsPerSet: 25,
  targetRosterSize: 6,
  status: 'SETUP',
};

export function TournamentFormDialog({
  open,
  tournament,
  onClose,
}: {
  open: boolean;
  tournament: Tournament | null;
  onClose: () => void;
}) {
  const create = useCreateTournament();
  const update = useUpdateTournament();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });

  useEffect(() => {
    if (open) {
      reset(
        tournament
          ? {
              name: tournament.name,
              date: tournament.date,
              startTime: tournament.startTime?.slice(0, 5),
              registrationDeadline: tournament.registrationDeadline ?? '',
              venue: tournament.venue ?? '',
              numberOfCourts: tournament.numberOfCourts,
              breakMinutes: tournament.breakMinutes,
              poolMatchDurationMinutes: tournament.poolMatchDurationMinutes,
              poolPointsPerSet: tournament.poolPointsPerSet,
              targetRosterSize: tournament.targetRosterSize,
              status: tournament.status,
            }
          : DEFAULTS,
      );
    }
  }, [open, tournament, reset]);

  async function onSubmit(values: FormValues) {
    const body = {
      ...values,
      startTime: `${values.startTime}:00`,
      registrationDeadline: values.registrationDeadline || null,
    };
    if (tournament) {
      await update.mutateAsync({ id: tournament.id, body });
    } else {
      await create.mutateAsync(body);
    }
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{tournament ? 'Edit tournament' : 'New tournament'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                label="Tournament name"
                fullWidth
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('date')}
                error={!!errors.date}
                helperText={errors.date?.message}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Start time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('startTime')}
                error={!!errors.startTime}
                helperText={errors.startTime?.message}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Registration deadline"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('registrationDeadline')}
              />
            </Grid>
            <Grid item xs={6} />
            <Grid item xs={12}>
              <TextField label="Venue" fullWidth {...register('venue')} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Courts"
                type="number"
                fullWidth
                {...register('numberOfCourts')}
                error={!!errors.numberOfCourts}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Break (min)" type="number" fullWidth {...register('breakMinutes')} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Match (min)"
                type="number"
                fullWidth
                {...register('poolMatchDurationMinutes')}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Pts/set"
                type="number"
                fullWidth
                {...register('poolPointsPerSet')}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Roster size"
                type="number"
                fullWidth
                {...register('targetRosterSize')}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Status" select fullWidth defaultValue="SETUP" {...register('status')}>
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {tournament ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
