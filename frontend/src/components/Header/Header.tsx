import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import {
  Avatar, Badge, Box, Button, Divider, IconButton, List, ListItemButton, ListItemText, Menu, MenuItem, Popover, Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useMarkNotificationRead, useNotifications } from '../../features/notifications/hooks';
import { formatDateTime } from '../../utils/format';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const { username, logout } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);
  const unread = notifications.filter((n) => !n.read).length;
  const latest = notifications.slice(0, 6);

  return (
    <Box
      component="header"
      sx={{
        display: 'flex', alignItems: 'center', gap: 1, px: { xs: 1.5, md: 4 }, py: 1.25,
        position: 'sticky', top: 0, zIndex: 10, bgcolor: 'rgba(243,246,252,0.8)', backdropFilter: 'blur(10px)',
      }}
    >
      <IconButton aria-label="Open menu" onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
        <MenuIcon />
      </IconButton>
      <Box sx={{ flexGrow: 1 }} />
      <IconButton aria-label={`Notifications, ${unread} unread`} onClick={(e) => setAnchor(e.currentTarget)}>
        <Badge badgeContent={unread} color="error">
          <NotificationsNoneOutlined />
        </Badge>
      </IconButton>
      <IconButton aria-label="Account menu" onClick={(e) => setUserAnchor(e.currentTarget)} sx={{ p: 0.25 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
          {(username ?? 'A').charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}>
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 0.5 }}>Signed in as <strong>{username}</strong></Typography>
        <Divider />
        <MenuItem onClick={() => { setUserAnchor(null); void logout(); }}>Log out</MenuItem>
      </Menu>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 340, maxWidth: '92vw', borderRadius: 3 } } }}
      >
        <Typography sx={{ fontWeight: 700, px: 2, pt: 1.5, pb: 1 }}>Notifications</Typography>
        <Divider />
        {isLoading ? (
          <Typography color="text.secondary" variant="body2" sx={{ p: 2 }}>Loading notifications...</Typography>
        ) : latest.length === 0 ? (
          <Typography color="text.secondary" variant="body2" sx={{ p: 2 }}>No notifications yet.</Typography>
        ) : (
          <List disablePadding>
            {latest.map((n) => (
              <ListItemButton
                key={n.id}
                onClick={() => {
                  if (!n.read) markRead.mutate(n.id);
                  setAnchor(null);
                  navigate(`/products/${n.productId}`);
                }}
                sx={{ alignItems: 'flex-start', bgcolor: n.read ? undefined : 'primary.light' }}
              >
                <ListItemText
                  primary={n.message}
                  secondary={formatDateTime(n.createdAt)}
                  slotProps={{ primary: { fontSize: '0.875rem', fontWeight: n.read ? 400 : 600 } }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
        <Divider />
        <Button fullWidth onClick={() => { setAnchor(null); navigate('/notifications'); }} sx={{ py: 1 }}>
          View all
        </Button>
      </Popover>
    </Box>
  );
}
