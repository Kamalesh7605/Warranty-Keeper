import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import FolderOutlined from '@mui/icons-material/FolderOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { gradients } from '../../theme/theme';
import { Logo } from '../Common/Logo';

export const SIDEBAR_WIDTH = 248;

const ITEMS: { label: string; to: string; icon: ReactNode }[] = [
  { label: 'Dashboard', to: '/', icon: <DashboardOutlined /> },
  { label: 'Products', to: '/products', icon: <Inventory2Outlined /> },
  { label: 'Categories', to: '/categories', icon: <FolderOutlined /> },
  { label: 'Export', to: '/export', icon: <FileDownloadOutlined /> },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{ p: 2, height: '100%', background: gradients.sidebar, display: 'flex', flexDirection: 'column' }}
    >
      <Box sx={{ px: 1, py: 1.5, mb: 3 }}><Logo light /></Box>
      <Typography sx={{ px: 1.5, mb: 1, fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1, color: 'rgba(255,255,255,0.45)' }}>
        MENU
      </Typography>
      <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
        {ITEMS.map((item) => {
          const active = isActive(item.to);
          return (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              onClick={onNavigate}
              selected={active}
              sx={{
                borderRadius: 2.5, py: 1.1, color: active ? '#fff' : 'rgba(255,255,255,0.72)',
                transition: 'all .15s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' },
                '&.Mui-selected, &.Mui-selected:hover': {
                  background: gradients.primary, color: '#fff', boxShadow: '0 6px 16px rgba(37,99,235,0.45)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { fontSize: '0.92rem', fontWeight: 600 } }} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>Never miss a warranty</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', mt: 0.5 }}>
          Add bills and warranty cards once. We remind you before they expire.
        </Typography>
      </Box>
    </Box>
  );
}
