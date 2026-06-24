import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../../auth/AuthContext';
import styles from './ForgotPasswordPage.module.css';

export function ForgotPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await resetPassword(email, password);
      navigate(res.role === 'ADMIN' ? '/admin' : '/me');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not reset your password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box className={styles.root}>
      <Container maxWidth="xs">
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Reset password
            </Typography>
            <Typography variant="body2" color="text.secondary" className={styles.subtitle}>
              Enter the email you registered with and choose a new password.
            </Typography>
            {error && (
              <Alert severity="error" className={styles.alert}>
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
                label="New password (min 8 characters)"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputProps={{ minLength: 8 }}
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
                {submitting ? 'Resetting…' : 'Reset password'}
              </Button>
            </Box>
            <Stack direction="row" justifyContent="center" className={styles.linksRow}>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to log in
              </Link>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}