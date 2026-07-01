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
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useAuth } from '../../auth/AuthContext';

const DRAWER_WIDTH = 230;

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: <DashboardIcon />, exact: true },
  { to: '/admin/tournaments', label: 'Tournaments', icon: <EmojiEventsIcon /> },
  { to: '/admin/players', label: 'Players', icon: <PersonIcon /> },
  { to: '/admin/referees', label: 'Referees', icon: <SportsIcon /> },
  { to: '/admin/teams', label: 'Teams', icon: <GroupsIcon /> },
  { to: '/admin/toss', label: 'Coin Toss', icon: <MonetizationOnIcon /> },
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

  const drawerContent = (
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
            onClick={() => isMobile && setDrawerOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }} elevation={0}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Volleyball Admin
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.85, display: { xs: 'none', sm: 'block' } }}>
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

      {/* Mobile: temporary drawer that slides in over content */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop: permanent drawer always visible */
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
