import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Grid,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { POSITIONS, SKILL_LEVELS, TSHIRT_SIZES } from '../../types';
import type { Player, Position } from '../../types';
import { useUpdatePlayer } from '../../api/players';

export function PlayerEditDialog({
  player,
  onClose,
}: {
  player: Player | null;
  onClose: () => void;
}) {
  const update = useUpdatePlayer();
  const [form, setForm] = useState<Player | null>(player);
  const [posError, setPosError] = useState(false);

  useEffect(() => {
    setForm(player);
    setPosError(false);
  }, [player]);

  if (!form) return null;

  const set = (patch: Partial<Player>) => setForm({ ...form, ...patch });

  async function onSave() {
    if (!form) return;
    const positions = form.preferredPositions;
    const valid = positions.includes('REFEREE') ? positions.length === 1 : positions.length === 2;
    if (!valid) {
      setPosError(true);
      return;
    }
    await update.mutateAsync({
      id: form.id,
      body: {
        firstName: form.firstName,
        middleName: form.middleName ?? undefined,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        address: form.address ?? undefined,
        preferredPositions: form.preferredPositions,
        tshirtSize: form.tshirtSize,
        emergencyContactName: form.emergencyContactName ?? undefined,
        emergencyContactPhone: form.emergencyContactPhone ?? undefined,
        skillLevel: form.skillLevel ?? undefined,
        yearsExperience: form.yearsExperience ?? undefined,
        jerseyNumberPreference: form.jerseyNumberPreference ?? undefined,
        paymentStatus: form.paymentStatus,
        dietaryNotes: form.dietaryNotes ?? undefined,
        gender: form.gender ?? undefined,
        dateOfBirth: form.dateOfBirth ?? undefined,
        notes: form.notes ?? undefined,
      },
    });
    onClose();
  }

  return (
    <Dialog open={!!player} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit player</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={4}>
            <TextField label="First name" fullWidth value={form.firstName}
              onChange={(e) => set({ firstName: e.target.value })} />
          </Grid>
          <Grid item xs={4}>
            <TextField label="Middle" fullWidth value={form.middleName ?? ''}
              onChange={(e) => set({ middleName: e.target.value })} />
          </Grid>
          <Grid item xs={4}>
            <TextField label="Last name" fullWidth value={form.lastName}
              onChange={(e) => set({ lastName: e.target.value })} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Phone" fullWidth value={form.phone}
              onChange={(e) => set({ phone: e.target.value })} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Email" fullWidth value={form.email}
              onChange={(e) => set({ email: e.target.value })} />
          </Grid>

          <Grid item xs={12}>
            {(() => {
              const isReferee = form.preferredPositions.includes('REFEREE');
              return (
                <>
                  <Typography variant="caption" color="text.secondary">
                    {isReferee ? 'Position — Referee selected' : 'Positions (pick 2)'}
                  </Typography>
                  <br />
                  <ToggleButtonGroup
                    value={form.preferredPositions}
                    onChange={(_, val: string[]) => {
                      if (val.includes('REFEREE')) {
                        set({ preferredPositions: ['REFEREE'] as Position[] });
                      } else if (val.length <= 2) {
                        set({ preferredPositions: val as Position[] });
                      }
                      setPosError(false);
                    }}
                    size="small"
                    sx={{ flexWrap: 'wrap', gap: 0.5 }}
                  >
                    {POSITIONS.map((p) => (
                      <ToggleButton key={p} value={p} disabled={isReferee && p !== 'REFEREE'}>
                        {p}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  {posError && (
                    <FormHelperText error>Select Referee only, or pick exactly two positions</FormHelperText>
                  )}
                </>
              );
            })()}
          </Grid>

          <Grid item xs={4}>
            <TextField select label="Shirt" fullWidth value={form.tshirtSize}
              onChange={(e) => set({ tshirtSize: e.target.value as Player['tshirtSize'] })}>
              {TSHIRT_SIZES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField select label="Skill" fullWidth value={form.skillLevel ?? ''}
              onChange={(e) => set({ skillLevel: (e.target.value || null) as Player['skillLevel'] })}>
              <MenuItem value="">—</MenuItem>
              {SKILL_LEVELS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField select label="Payment" fullWidth value={form.paymentStatus}
              onChange={(e) => set({ paymentStatus: e.target.value as Player['paymentStatus'] })}>
              <MenuItem value="UNPAID">UNPAID</MenuItem>
              <MenuItem value="PAID">PAID</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSave} disabled={update.isPending}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
