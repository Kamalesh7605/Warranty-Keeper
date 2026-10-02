import { Box, Typography } from '@mui/material';

export function Logo({ size = 28, light = false }: { size?: number; light?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id="wk-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#60a5fa" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <path fill="url(#wk-logo)" d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        <path fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="m8 12.3 2.8 2.8L16.2 9.5" />
      </svg>
      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: -0.3, color: light ? '#fff' : 'text.primary' }}>
        Warranty Keeper
      </Typography>
    </Box>
  );
}
