import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <Box sx={{ animation: 'fadeUp .35s ease both' }}>
        <Typography variant="h4" component="h1">{title}</Typography>
        {subtitle && <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
      </Box>
      {action}
    </Box>
  );
}
