import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import NotificationsActiveOutlined from '@mui/icons-material/NotificationsActiveOutlined';
import QrCodeScannerOutlined from '@mui/icons-material/QrCodeScannerOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import { Alert, Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { Logo } from '../components/Common/Logo';
import { useAuth } from '../features/auth/AuthContext';
import { getErrorMessage } from '../services/api';
import { gradients } from '../theme/theme';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to sign in.'));
      setSubmitting(false);
    }
  };

  const perks = [
    { icon: <DescriptionOutlined />, text: 'Store bills and warranty cards in one place' },
    { icon: <QrCodeScannerOutlined />, text: 'Scan a barcode or QR code to add products fast' },
    { icon: <NotificationsActiveOutlined />, text: 'Get reminded before a warranty expires' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, bgcolor: 'background.paper' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', p: 6, color: '#fff',
          background: gradients.hero, position: 'relative', overflow: 'hidden',
          '&::after': { content: '""', position: 'absolute', right: -120, bottom: -140, width: 420, height: 420, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' },
        }}
      >
        <Logo size={36} light />
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
          <Typography sx={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: -1 }}>
            Every warranty, bill and product in one place.
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, mt: 4 }}>
            {perks.map((p) => (
              <Box key={p.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.18)' }}>{p.icon}</Box>
                <Typography sx={{ opacity: 0.95 }}>{p.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>Warranty Keeper</Typography>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', p: 3, bgcolor: 'background.default' }}>
        <Box component="form" noValidate onSubmit={submit} sx={{ width: '100%', maxWidth: 400, display: 'grid', gap: 2.5 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 1 }}><Logo size={36} /></Box>
          <Box>
            <Typography variant="h4" component="h1">Welcome back</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Sign in to the admin account to continue</Typography>
          </Box>
          {error && <Alert severity="error" role="alert">{error}</Alert>}
          <TextField label="Username" autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} edge="end" onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button type="submit" variant="contained" size="large" startIcon={<LockOutlined />} disabled={submitting} sx={{ py: 1.25 }}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
