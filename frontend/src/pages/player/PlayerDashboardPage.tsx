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
  Typography,
} from '@mui/material';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import StarIcon from '@mui/icons-material/Star';
import { useMyPlayer } from '../../api/players';
import { useMyTeam, useMyRoster } from '../../api/teams';
import { useAuth } from '../../auth/AuthContext';

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <SportsVolleyballIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
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

      <Container maxWidth="md" sx={{ py: 4 }}>
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
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar src={player.photoUrl ?? undefined} sx={{ width: 80, height: 80 }} />
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
                <Divider sx={{ my: 2 }} />
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
                                <Avatar src={m.photoUrl ?? undefined} sx={{ width: 40, height: 40 }} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    <span>{m.fullName}</span>
                                    {m.captain && <StarIcon fontSize="small" color="warning" />}
                                  </Stack>
                                }
                                secondary={
                                  <>
                                    <Box component="span" sx={{ display: 'block' }}>
                                      {[m.preferredPositions.join(', '), m.skillLevel]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    </Box>
                                    <Box component="span" sx={{ display: 'block' }}>
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
                              <Avatar src={m.photoUrl ?? undefined} sx={{ width: 32, height: 32 }} />
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
