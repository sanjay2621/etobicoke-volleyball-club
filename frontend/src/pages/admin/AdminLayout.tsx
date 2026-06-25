import { useState } from 'react';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import SportsIcon from '@mui/icons-material/Sports';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckroomIcon from '@mui/icons-material/Checkroom';
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
  { to: '/admin/tshirts', label: 'T-Shirts', icon: <CheckroomIcon /> },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navList = (
    <List onClick={() => isMobile && setDrawerOpen(false)}>
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
  );

  return (
    <Box className={styles.root}>
      <AppBar position="fixed" className={styles.appBar} elevation={0}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              className={styles.menuBtn}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" className={styles.appBarTitle}>
            Volleyball Admin
          </Typography>
          {!isMobile && (
            <Typography variant="body2" className={styles.appBarEmail}>
              {user?.email}
            </Typography>
          )}
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

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          className={styles.drawerMobile}
          ModalProps={{ keepMounted: true }}
        >
          <Toolbar />
          {navList}
        </Drawer>
      ) : (
        <Drawer variant="permanent" className={styles.drawer}>
          <Toolbar />
          {navList}
        </Drawer>
      )}

      <Box component="main" className={isMobile ? styles.mainMobile : styles.main}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
