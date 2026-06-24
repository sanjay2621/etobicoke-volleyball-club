import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import SportsIcon from '@mui/icons-material/Sports';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from '../../auth/AuthContext';
import styles from './AdminLayout.module.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: <DashboardIcon />, exact: true },
  { to: '/admin/tournaments', label: 'Tournaments', icon: <EmojiEventsIcon /> },
  { to: '/admin/players', label: 'Players', icon: <PersonIcon /> },
  { to: '/admin/referees', label: 'Referees', icon: <SportsIcon /> },
  { to: '/admin/teams', label: 'Teams', icon: <GroupsIcon /> },
  { to: '/admin/draft', label: 'Draft', icon: <HowToRegIcon /> },
  { to: '/admin/schedule', label: 'Schedule', icon: <CalendarMonthIcon /> },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box className={styles.root}>
      <AppBar position="fixed" className={styles.appBar} elevation={0}>
        <Toolbar>
          <Typography variant="h6" className={styles.appBarTitle}>
            Volleyball Admin
          </Typography>
          <Typography variant="body2" className={styles.appBarEmail}>
            {user?.email}
          </Typography>
          <Button
            color="inherit"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Log out
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        className={styles.drawer}
      >
        <Toolbar />
        <List>
          {NAV.map((item) => {
            const selected = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                selected={selected}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" className={styles.main}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
