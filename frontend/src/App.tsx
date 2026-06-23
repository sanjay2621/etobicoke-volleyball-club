import { Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { adminTheme, playerTheme } from './theme/themes';
import { RequireAuth } from './auth/guards';
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { SetPasswordPage } from './pages/public/SetPasswordPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { PlayerDashboardPage } from './pages/player/PlayerDashboardPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { TournamentsPage } from './pages/admin/TournamentsPage';
import { PlayersPage } from './pages/admin/PlayersPage';
import { RefereesPage } from './pages/admin/RefereesPage';
import { TeamsPage } from './pages/admin/TeamsPage';
import { DraftPage } from './pages/admin/DraftPage';
import { SchedulePage } from './pages/admin/SchedulePage';
import { AdminHomePage } from './pages/admin/AdminHomePage';

/** Public + player routes use the energetic playerTheme; /admin uses adminTheme. */
export function App() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <ThemeProvider theme={adminTheme}>
            <RequireAuth role="ADMIN" />
          </ThemeProvider>
        }
      >
        <Route element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="tournaments" element={<TournamentsPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="referees" element={<RefereesPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="draft" element={<DraftPage />} />
          <Route path="schedule" element={<SchedulePage />} />
        </Route>
      </Route>

      <Route
        path="/*"
        element={
          <ThemeProvider theme={playerTheme}>
            <PublicRoutes />
          </ThemeProvider>
        }
      />
    </Routes>
  );
}

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<RequireAuth role="PLAYER" />}>
        <Route path="/me" element={<PlayerDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
