import { Box, CircularProgress, Typography } from '@mui/material';

export function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <Box role="status" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 8 }}>
      <CircularProgress size={32} />
      <Typography color="text.secondary" variant="body2">{label}</Typography>
    </Box>
  );
}
