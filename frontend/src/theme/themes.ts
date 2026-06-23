import { createTheme } from '@mui/material/styles';

/**
 * Two distinct looks:
 *  - playerTheme: energetic, welcoming public/player site (navy + coral).
 *  - adminTheme: dense, professional admin dashboard (slate/teal).
 */

export const playerTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1A2B4A' }, // deep volleyball navy
    secondary: { main: '#FF6B35' }, // vibrant coral
    background: { default: '#F7F9FC', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontFamily: '"Poppins", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { styleOverrides: { root: { boxShadow: '0 8px 28px rgba(26,43,74,0.08)' } } },
  },
});

export const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0F4C5C' }, // slate teal
    secondary: { main: '#E36414' },
    background: { default: '#EEF1F4', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true, size: 'small' } },
    MuiTableCell: { styleOverrides: { root: { paddingTop: 8, paddingBottom: 8 } } },
  },
});
