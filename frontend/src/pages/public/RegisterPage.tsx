import { useState, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import { POSITIONS, SKILL_LEVELS, TSHIRT_SIZES } from '../../types';
import type { Position } from '../../types';
import { useActivePublicTournaments } from '../../api/tournaments';
import { useRegisterPlayer } from '../../api/players';

function formatPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 10);
  if (d.length === 0) return '';
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)})-${d.slice(3)}`;
  return `(${d.slice(0, 3)})-${d.slice(3, 6)}-${d.slice(6)}`;
}

const phoneRule = z
  .string()
  .refine((v) => v.replace(/\D/g, '').length === 10, 'Enter a 10-digit phone number, e.g. (416)-555-1234');

const schema = z.object({
  tournamentId: z.coerce.number().int().positive('Choose a tournament'),
  firstName: z.string().min(1, 'Required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Required'),
  phone: phoneRule,
  email: z.string().email('Enter a valid email address'),
  line1: z
    .string()
    .optional()
    .refine((v) => !v || v.trim().length >= 3, 'Enter a valid street address'),
  city: z
    .string()
    .optional()
    .refine((v) => !v || v.trim().length >= 2, 'Enter a valid city'),
  province: z
    .string()
    .optional()
    .refine((v) => !v || v.trim().length >= 2, 'Enter a valid province'),
  postalCode: z
    .string()
    .optional()
    .refine((v) => !v || /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(v.trim()), 'Enter a valid postal code, e.g. M4B 1B3'),
  country: z.string().min(1),
  preferredPositions: z.array(z.string()).refine(
    (val) => (val.includes('REFEREE') ? val.length === 1 : val.length === 2),
    { message: 'Select Referee only, or pick exactly two positions' },
  ),
  tshirtSize: z.enum(['S', 'M', 'L', 'XL', 'XXL', 'XXXL']),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z
    .string()
    .optional()
    .refine((v) => !v || v.replace(/\D/g, '').length === 10, 'Enter a 10-digit phone number, e.g. (416)-555-1234'),
  skillLevel: z.string().optional(),
  waiverAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the waiver' }) }),
  photoConsent: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

/** Keep in sync with backend app.storage.max-photo-bytes (10 MB). */
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export function RegisterPage() {
  const navigate = useNavigate();
  const { data: tournaments } = useActivePublicTournaments();
  const register = useRegisterPlayer();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [doneEmail, setDoneEmail] = useState<string | null>(null);

  const {
    register: field,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: 'Canada',
      preferredPositions: [],
      tshirtSize: 'M',
      photoConsent: false,
    } as Partial<FormValues> as FormValues,
  });

  const selectedTournamentId = watch('tournamentId');
  const selectedTournament = useMemo(
    () => tournaments?.find((t) => t.id === Number(selectedTournamentId)),
    [tournaments, selectedTournamentId],
  );
  const isReferee = (watch('preferredPositions') as string[]).includes('REFEREE');

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_PHOTO_BYTES) {
      setError('That photo is too large. Please choose an image under 10 MB.');
      e.target.value = '';
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }
    setError(null);
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await register.mutateAsync({
        data: {
          tournamentId: values.tournamentId,
          firstName: values.firstName,
          middleName: values.middleName || undefined,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
          address: {
            line1: values.line1,
            city: values.city,
            province: values.province,
            postalCode: values.postalCode,
            country: values.country,
          },
          preferredPositions: values.preferredPositions as Position[],
          tshirtSize: values.tshirtSize,
          emergencyContactName: values.emergencyContactName || undefined,
          emergencyContactPhone: values.emergencyContactPhone || undefined,
          skillLevel: (values.skillLevel || undefined) as never,
          waiverAccepted: values.waiverAccepted,
          photoConsent: !!values.photoConsent,
        },
        photo,
      });
      setDoneEmail(values.email);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    }
  }

  if (doneEmail) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              You're registered! 🏐
            </Typography>
            <Typography color="text.secondary" paragraph>
              Set a password to log in and view your team once the draft happens.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate(`/set-password?email=${encodeURIComponent(doneEmail)}`)}
            >
              Set my password
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0F1D35 0%, #1A2B4A 45%, #2C4A7A 100%)',
          color: 'common.white',
          py: { xs: 5, md: 7 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <SportsVolleyballIcon
          sx={{ position: 'absolute', right: { xs: -40, md: 80 }, top: '50%', transform: 'translateY(-50%)', fontSize: { xs: 200, md: 320 }, opacity: 0.07, color: 'white' }}
        />
        <SportsVolleyballIcon
          sx={{ position: 'absolute', left: -50, bottom: -40, fontSize: 220, opacity: 0.05, color: 'white' }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Button component={RouterLink} to="/" sx={{ color: 'rgba(255,255,255,0.75)', mb: 2, '&:hover': { color: 'white' } }}>
            ← Home
          </Button>
          <Stack direction="row" alignItems="center" spacing={2}>
            <SportsVolleyballIcon sx={{ fontSize: 48, opacity: 0.9 }} />
            <Box>
              <Typography variant="h3" fontWeight={800} letterSpacing={-0.5}>
                Register to Play
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, mt: 0.5 }}>
                Etobicoke Volleyball Club — fill in your details below to secure your spot.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="tournamentId"
                  render={({ field: f }) => (
                    <TextField
                      select
                      label="Tournament"
                      fullWidth
                      value={f.value ?? ''}
                      onChange={f.onChange}
                      error={!!errors.tournamentId}
                      helperText={errors.tournamentId?.message}
                    >
                      {tournaments?.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.name} — {new Date(t.date).toLocaleDateString()}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                {selectedTournament?.registrationDeadline && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Registration deadline:{' '}
                    <strong>
                      {new Date(selectedTournament.registrationDeadline).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </strong>
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField label="First name" fullWidth {...field('firstName')}
                  error={!!errors.firstName} helperText={errors.firstName?.message} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Middle name" fullWidth {...field('middleName')} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Last name" fullWidth {...field('lastName')}
                  error={!!errors.lastName} helperText={errors.lastName?.message} />
              </Grid>

              <Grid item xs={12} sm={6}>
                {(() => {
                  const reg = field('phone');
                  return (
                    <TextField
                      label="Phone"
                      fullWidth
                      placeholder="(416)-555-1234"
                      {...reg}
                      onChange={(e) => {
                        e.target.value = formatPhone(e.target.value);
                        reg.onChange(e);
                      }}
                      inputProps={{ maxLength: 14 }}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  );
                })()}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" type="email" fullWidth {...field('email')}
                  error={!!errors.email} helperText={errors.email?.message} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Street address"
                  fullWidth
                  {...field('line1')}
                  error={!!errors.line1}
                  helperText={errors.line1?.message}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="City"
                  fullWidth
                  {...field('city')}
                  error={!!errors.city}
                  helperText={errors.city?.message}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Province"
                  fullWidth
                  {...field('province')}
                  error={!!errors.province}
                  helperText={errors.province?.message}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Postal code"
                  fullWidth
                  placeholder="M4B 1B3"
                  {...field('postalCode')}
                  error={!!errors.postalCode}
                  helperText={errors.postalCode?.message}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label="Country" fullWidth {...field('country')} />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="preferredPositions"
                  render={({ field: f }) => {
                    const isReferee = (f.value as string[]).includes('REFEREE');
                    return (
                      <>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          {isReferee ? 'Position — Referee selected' : 'Two best positions'}
                        </Typography>
                        <ToggleButtonGroup
                          value={f.value}
                          onChange={(_, val: string[]) => {
                            if (val.includes('REFEREE')) {
                              f.onChange(['REFEREE']);
                            } else if (val.length <= 2) {
                              f.onChange(val);
                            }
                          }}
                          sx={{ flexWrap: 'wrap', gap: 1 }}
                        >
                          {POSITIONS.map((p) => (
                            <ToggleButton
                              key={p}
                              value={p}
                              disabled={isReferee && p !== 'REFEREE'}
                              sx={{ borderRadius: 2 }}
                            >
                              {p}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                      </>
                    );
                  }}
                />
                {errors.preferredPositions && (
                  <FormHelperText error>{errors.preferredPositions.message as string}</FormHelperText>
                )}
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField select label="T-shirt size" fullWidth defaultValue="M" {...field('tshirtSize')}>
                  {TSHIRT_SIZES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              {!isReferee && (
                <Grid item xs={6} sm={3}>
                  <TextField select label="Skill level" fullWidth defaultValue="" {...field('skillLevel')}>
                    <MenuItem value="">—</MenuItem>
                    {SKILL_LEVELS.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={photoPreview ?? undefined} sx={{ width: 56, height: 56 }} />
                  <Button variant="outlined" component="label">
                    Upload photo
                    <input hidden type="file" accept="image/*" onChange={onPhotoChange} />
                  </Button>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField label="Emergency contact name" fullWidth {...field('emergencyContactName')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                {(() => {
                  const reg = field('emergencyContactPhone');
                  return (
                    <TextField
                      label="Emergency contact phone"
                      fullWidth
                      placeholder="(416)-555-1234"
                      {...reg}
                      onChange={(e) => {
                        e.target.value = formatPhone(e.target.value);
                        reg.onChange(e);
                      }}
                      inputProps={{ maxLength: 14 }}
                      error={!!errors.emergencyContactPhone}
                      helperText={errors.emergencyContactPhone?.message}
                    />
                  );
                })()}
              </Grid>

              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="photoConsent"
                  render={({ field: f }) => (
                    <FormControlLabel
                      control={<Checkbox checked={!!f.value} onChange={f.onChange} />}
                      label="I consent to my photo being used for tournament purposes"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="waiverAccepted"
                  render={({ field: f }) => (
                    <Box>
                      <FormControlLabel
                        control={<Checkbox checked={!!f.value} onChange={f.onChange} />}
                        label="I accept the liability waiver and tournament rules *"
                      />
                      {errors.waiverAccepted && (
                        <FormHelperText error>{errors.waiverAccepted.message as string}</FormHelperText>
                      )}
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit registration'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      </Container>
    </Box>
  );
}
