import { useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import StarIcon from '@mui/icons-material/Star';
import { useMarkPayment, useMyPlayer, useUploadMyPhoto } from '../../api/players';
import { useMyTeam, useMyRoster } from '../../api/teams';
import { useAuth } from '../../auth/AuthContext';
import styles from './PlayerDashboardPage.module.css';

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <Grid item xs={6} sm={4}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography>{value ?? '—'}</Typography>
    </Grid>
  );
}

export function PlayerDashboardPage() {
  const { data: player, isLoading, isError } = useMyPlayer();
  const { data: team } = useMyTeam();
  // isCaptain drives the Captain chip; roster is fetched whenever on a team so the
  // backend's 403 (for non-captains) is the authoritative gate rather than the local flag.
  const isCaptain = !!player && !!team && team.captainPlayerId === player.id;
  const { data: roster } = useMyRoster(!!team);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const uploadMyPhoto = useUploadMyPhoto();
  const markPayment = useMarkPayment();
  const photoInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box className={styles.root}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <SportsVolleyballIcon className={styles.appBarIcon} />
          <Typography variant="h6" className={styles.appBarTitle}>
            My Tournament
          </Typography>
          <Button
            color="inherit"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Log out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" className={styles.container}>
        {isLoading && <Typography>Loading…</Typography>}
        {isError && (
          <Card>
            <CardContent>
              <Typography gutterBottom>We couldn't find a registration linked to your account.</Typography>
              <Button component={RouterLink} to="/register" variant="contained" color="secondary">
                Register now
              </Button>
            </CardContent>
          </Card>
        )}
        {player && (
          <>
            <Card className={styles.profileCard}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'center' }}>
                  <Box>
                    <Tooltip title={player.photoUrl ? 'Change photo' : 'Upload photo'}>
                      <Box
                        className={styles.avatarWrapper}
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <Avatar src={player.photoUrl ?? undefined} className={styles.avatar} />
                        <Box className={styles.avatarOverlay}>
                          <AddPhotoAlternateIcon className={styles.overlayIcon} />
                        </Box>
                      </Box>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary" className={styles.photoCaption}>
                      {uploadMyPhoto.isPending ? 'Uploading…' : 'Click to change'}
                    </Typography>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      ref={photoInputRef}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await uploadMyPhoto.mutateAsync(file);
                        e.target.value = '';
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="h4">{player.fullName}</Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      {player.preferredPositions.map((p) => (
                        <Chip key={p} label={p} color="secondary" size="small" />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Registration details
                </Typography>
                <Grid container spacing={2}>
                  <Detail label="Email" value={player.email} />
                  <Detail label="Phone" value={player.phone} />
                  <Detail label="T-shirt size" value={player.tshirtSize} />
                  <Detail label="Skill level" value={player.skillLevel} />
                  <Detail label="Payment" value={player.paymentStatus} />
                  <Detail label="Jersey #" value={player.jerseyNumberPreference} />
                </Grid>
                <Divider className={styles.divider} />
                <Typography variant="h6" gutterBottom>
                  My team
                </Typography>
                {!team && (
                  <Typography color="text.secondary">
                    You haven't been assigned to a team yet. Check back after the draft.
                  </Typography>
                )}
                {team && (
                  <>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {team.name}
                      </Typography>
                      {team.groupLabel && <Chip size="small" label={`Group ${team.groupLabel}`} />}
                      {isCaptain && <Chip size="small" color="warning" icon={<StarIcon />} label="Captain" />}
                    </Stack>
                    {roster ? (
                      <>
                        <Typography variant="caption" color="text.secondary">
                          As captain you can see your team's contact details.
                        </Typography>
                        <List dense>
                          {roster.members.map((m) => (
                            <ListItem key={m.playerId} disableGutters alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar src={m.photoUrl ?? undefined} className={styles.memberAvatarLg} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                                    <span>{m.fullName}</span>
                                    {m.captain && <StarIcon fontSize="small" color="warning" />}
                                    <Tooltip title={m.paymentStatus === 'PAID' ? 'Click to mark unpaid' : 'Click to mark paid'}>
                                      <Chip
                                        size="small"
                                        label={m.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}
                                        color={m.paymentStatus === 'PAID' ? 'success' : 'default'}
                                        className={styles.paymentChip}
                                        onClick={() =>
                                          markPayment.mutate({
                                            id: m.playerId,
                                            paymentStatus: m.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID',
                                          })
                                        }
                                        disabled={markPayment.isPending}
                                      />
                                    </Tooltip>
                                  </Stack>
                                }
                                secondary={
                                  <>
                                    <Box component="span" className={styles.inlineBlock}>
                                      {[m.preferredPositions.join(', '), m.skillLevel]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    </Box>
                                    <Box component="span" className={styles.inlineBlock}>
                                      {[m.phone, m.email].filter(Boolean).join(' · ') || '—'}
                                    </Box>
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    ) : (
                      <List dense>
                        {team.members.map((m) => (
                          <ListItem key={m.playerId} disableGutters>
                            <ListItemAvatar>
                              <Avatar src={m.photoUrl ?? undefined} className={styles.memberAvatarSm} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <span>{m.fullName}</span>
                                  {m.captain && <StarIcon fontSize="small" color="warning" />}
                                </Stack>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
}
