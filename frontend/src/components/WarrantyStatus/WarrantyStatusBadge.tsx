import { Box } from '@mui/material';
import { statusColors } from '../../theme/theme';
import type { WarrantyStatus } from '../../types/product';

const CONFIG: Record<WarrantyStatus, { label: string; tone: keyof typeof statusColors }> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  EXPIRING_SOON: { label: 'Expiring Soon', tone: 'warning' },
  EXPIRES_TODAY: { label: 'Expires Today', tone: 'warning' },
  EXPIRED: { label: 'Expired', tone: 'error' },
  NO_WARRANTY: { label: 'No Warranty', tone: 'neutral' },
};

export function WarrantyStatusBadge({ status }: { status: WarrantyStatus }) {
  const { label, tone } = CONFIG[status];
  const { bg, fg } = statusColors[tone];
  return (
    <Box
      component="span"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.4, borderRadius: 99, bgcolor: bg, color: fg, fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}
    >
      <Box component="span" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: fg }} />
      {label}
    </Box>
  );
}
