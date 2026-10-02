import { Box, Drawer } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/Header';
import { SIDEBAR_WIDTH, Sidebar } from '../Sidebar/Sidebar';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        sx={{
          width: SIDEBAR_WIDTH, flexShrink: 0, display: { xs: 'none', md: 'block' },
          position: 'sticky', top: 0, height: '100vh',
        }}
      >
        <Sidebar />
      </Box>
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH } }}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Header onMenuClick={() => setMobileOpen(true)} />
        <Box component="main" sx={{ px: { xs: 2, md: 4 }, pb: 6, maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ animation: 'fadeUp .35s ease both' }}><Outlet /></Box>
        </Box>
      </Box>
    </Box>
  );
}
