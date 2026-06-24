import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import { useAuth } from '../../auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await login(email, password);
      navigate(res.role === 'ADMIN' ? '/admin' : '/me');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0F1D35 0%, #1A2B4A 45%, #2C4A7A 100%)',
          color: 'common.white',
          py: { xs: 5, md: 7 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <SportsVolleyballIcon
          sx={{ position: 'absolute', right: { xs: -30, md: 60 }, top: '50%', transform: 'translateY(-50%)', fontSize: { xs: 180, md: 260 }, opacity: 0.07, color: 'white' }}
        />
        <SportsVolleyballIcon
          sx={{ position: 'absolute', left: { xs: -40, md: 20 }, bottom: -30, fontSize: { xs: 140, md: 200 }, opacity: 0.05, color: 'white' }}
        />
        <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
          <SportsVolleyballIcon sx={{ fontSize: 52, mb: 1, opacity: 0.9 }} />
          <Typography variant="h4" fontWeight={800} letterSpacing={-0.5}>
            Etobicoke Volleyball Club
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.75, mt: 1 }}>
            Welcome back — log in to view your team and schedule.
          </Typography>
        </Container>
      </Box>

      {/* Form */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          placeItems: 'center',
          py: 5,
          background: 'linear-gradient(160deg, #EEF4FF 0%, #E8F0FE 50%, #F0EEFF 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <SportsVolleyballIcon sx={{ position: 'absolute', top: 24, left: 24,   fontSize: 90,  color: '#1A2B4A', opacity: 0.07, pointerEvents: 'none' }} />
        <SportsVolleyballIcon sx={{ position: 'absolute', top: 16, right: 60,  fontSize: 55,  color: '#2C4A7A', opacity: 0.05, pointerEvents: 'none' }} />
        <SportsVolleyballIcon sx={{ position: 'absolute', bottom: 40, left: 80, fontSize: 70, color: '#2C4A7A', opacity: 0.05, pointerEvents: 'none' }} />
        <SportsVolleyballIcon sx={{ position: 'absolute', bottom: 20, right: 24, fontSize: 110, color: '#1A2B4A', opacity: 0.06, pointerEvents: 'none' }} />
        <SportsVolleyballIcon sx={{ position: 'absolute', top: '45%', left: '8%', fontSize: 44, color: '#2C4A7A', opacity: 0.04, pointerEvents: 'none' }} />
        <SportsVolleyballIcon sx={{ position: 'absolute', top: '30%', right: '6%', fontSize: 60, color: '#1A2B4A', opacity: 0.04, pointerEvents: 'none' }} />
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Log in
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={onSubmit}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                disabled={submitting}
              >
                {submitting ? 'Logging in…' : 'Log in'}
              </Button>
              <Stack direction="row" justifyContent="center" sx={{ mt: 1.5 }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot password?
                </Link>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Link component={RouterLink} to="/" variant="body2">
                ← Home
              </Link>
              <Typography variant="body2" color="text.secondary">
                New player?{' '}
                <Link component={RouterLink} to="/register">
                  Register
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
      </Box>
    </Box>
  );
}
