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

type Step = 'email' | 'code' | 'password';

export function ForgotPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { requestPasswordReset, resetPassword } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setStep('code');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not send reset code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function onVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError('Please enter the 6-digit code from your email.');
      return;
    }
    setError(null);
    setStep('password');
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await resetPassword(email, code, password);
      navigate(res.role === 'ADMIN' ? '/admin' : '/me');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not reset your password. Please try again.');
      if (err?.response?.status === 400) {
        // Code was invalid/expired — send them back to re-enter code
        setStep('code');
        setCode('');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box className={styles.root}>
      <Container maxWidth="xs">
        <Card>
          <CardContent>

            {/* Step 1: Enter email */}
            {step === 'email' && (
              <>
                <Typography variant="h5" gutterBottom fontWeight={700}>
                  Reset password
                </Typography>
                <Typography variant="body2" color="text.secondary" className={styles.subtitle}>
                  Enter your registered email and we'll send a 6-digit verification code.
                </Typography>
                {error && <Alert severity="error" className={styles.alert}>{error}</Alert>}
                <Box component="form" onSubmit={onRequestCode}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
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
                    {submitting ? 'Sending…' : 'Send code'}
                  </Button>
                </Box>
              </>
            )}

            {/* Step 2: Enter code */}
            {step === 'code' && (
              <>
                <Typography variant="h5" gutterBottom fontWeight={700}>
                  Check your email
                </Typography>
                <Typography variant="body2" color="text.secondary" className={styles.subtitle}>
                  We sent a 6-digit code to <strong>{email}</strong>. Enter it below. The code expires in 15 minutes.
                </Typography>
                {error && <Alert severity="error" className={styles.alert}>{error}</Alert>}
                <Box component="form" onSubmit={onVerifyCode}>
                  <TextField
                    label="6-digit code"
                    fullWidth
                    margin="normal"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
                    required
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    className={styles.submitBtn}
                  >
                    Verify code
                  </Button>
                  <Button
                    variant="text"
                    fullWidth
                    size="small"
                    className={styles.resendBtn}
                    disabled={submitting}
                    onClick={() => { setStep('email'); setCode(''); setError(null); }}
                  >
                    Resend code
                  </Button>
                </Box>
              </>
            )}

            {/* Step 3: Enter new password */}
            {step === 'password' && (
              <>
                <Typography variant="h5" gutterBottom fontWeight={700}>
                  Choose a new password
                </Typography>
                <Typography variant="body2" color="text.secondary" className={styles.subtitle}>
                  Must be at least 8 characters.
                </Typography>
                {error && <Alert severity="error" className={styles.alert}>{error}</Alert>}
                <Box component="form" onSubmit={onResetPassword}>
                  <TextField
                    label="New password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    inputProps={{ minLength: 8 }}
                    required
                    autoFocus
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
                    {submitting ? 'Saving…' : 'Set new password'}
                  </Button>
                </Box>
              </>
            )}

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
