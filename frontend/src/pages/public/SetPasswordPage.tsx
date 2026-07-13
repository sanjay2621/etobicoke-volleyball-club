import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../../auth/AuthContext';
import styles from './SetPasswordPage.module.css';

export function SetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { registerAccount } = useAuth();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerAccount(email, password);
      navigate('/me');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not create your login');
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
              Set your password
            </Typography>
            <Typography variant="body2" color="text.secondary" className={styles.subtitle}>
              Use the email you registered with.
            </Typography>
            <Alert severity="info" className={styles.alert}>
              Your registration has been submitted to the management team for review and is
              currently Pending. You can still create your login now — check back on your profile
              once it's approved.
            </Alert>
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
                label="Password (min 8 characters)"
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
                {submitting ? 'Creating…' : 'Create login'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
