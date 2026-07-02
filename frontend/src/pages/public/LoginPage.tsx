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
import styles from './LoginPage.module.css';

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
    <Box className={styles.root}>
      <Box className={styles.banner}>
        <SportsVolleyballIcon className={styles.bannerDecorRight} />
        <SportsVolleyballIcon className={styles.bannerDecorLeft} />
        <Container maxWidth="xs" className={styles.bannerContainer}>
          <SportsVolleyballIcon className={styles.bannerMainIcon} />
          <Typography variant="h4" fontWeight={800} letterSpacing={-0.5}>
            SANATANI Volleyball Club
          </Typography>
          <Typography variant="body1" className={styles.bannerSubtext}>
            Welcome back — log in to view your team and schedule.
          </Typography>
        </Container>
      </Box>

      <Box className={styles.formArea}>
        <SportsVolleyballIcon className={styles.formDecor1} />
        <SportsVolleyballIcon className={styles.formDecor2} />
        <SportsVolleyballIcon className={styles.formDecor3} />
        <SportsVolleyballIcon className={styles.formDecor4} />
        <SportsVolleyballIcon className={styles.formDecor5} />
        <SportsVolleyballIcon className={styles.formDecor6} />
        <Container maxWidth="xs" className={styles.formContainer}>
          <Card elevation={3}>
            <CardContent className={styles.cardContent}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Log in
              </Typography>
              {error && (
                <Alert severity="error" className={styles.errorAlert}>
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
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? 'Logging in…' : 'Log in'}
                </Button>
                <Stack direction="row" justifyContent="center" className={styles.forgotRow}>
                  <Link component={RouterLink} to="/forgot-password" variant="body2">
                    Forgot password?
                  </Link>
                </Stack>
              </Box>

              <Divider className={styles.divider} />

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
