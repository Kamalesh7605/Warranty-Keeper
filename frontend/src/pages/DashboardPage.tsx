import AddIcon from '@mui/icons-material/Add';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';
import { Avatar, Box, Button, Card, Link, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/Common/EmptyState';
import { ErrorState } from '../components/Common/ErrorState';
import { ProductAvatar } from '../components/Common/ProductAvatar';
import { Loading } from '../components/Loading/Loading';
import { useDashboardSummary, useExpiringProducts } from '../features/dashboard/hooks';
import { cardShadowHover, gradients, statusColors } from '../theme/theme';
import type { DashboardSummary } from '../types/product';
import { describeExpiry, formatDate } from '../utils/format';

interface Tone { bg: string; fg: string }

function StatCard({ value, label, icon, tone, to }: { value: number; label: string; icon: ReactNode; tone: Tone; to: string }) {
  return (
    <Card
      component={RouterLink}
      to={to}
      sx={{
        p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit',
        position: 'relative', overflow: 'hidden', transition: 'transform .18s, box-shadow .18s',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: cardShadowHover },
        '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: tone.fg },
      }}
    >
      <Box>
        <Typography sx={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.1, color: tone.fg }}>{value}</Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>{label}</Typography>
      </Box>
      <Avatar sx={{ bgcolor: tone.bg, color: tone.fg, width: 46, height: 46 }}>{icon}</Avatar>
    </Card>
  );
}

function HealthBar({ summary }: { summary: DashboardSummary }) {
  const segments = [
    { label: 'Active', value: summary.activeWarranty, color: '#22c55e' },
    { label: 'Expiring soon', value: summary.expiringSoon, color: '#f59e0b' },
    { label: 'Expired', value: summary.expired, color: '#ef4444' },
  ];
  const counted = segments.reduce((n, s) => n + s.value, 0);
  return (
    <Card sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Warranty health</Typography>
        <Typography variant="body2" color="text.secondary">{counted} with a warranty</Typography>
      </Box>
      <Box sx={{ display: 'flex', height: 14, borderRadius: 99, overflow: 'hidden', bgcolor: '#eef1f7' }} role="img"
        aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(', ')}>
        {counted > 0 && segments.filter((s) => s.value > 0).map((s) => (
          <Box key={s.label} sx={{ width: `${(s.value / counted) * 100}%`, bgcolor: s.color, transition: 'width .6s' }} />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
        {segments.map((s) => (
          <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }} />
            <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.value}</Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

function dayPill(days: number | null): Tone {
  return days !== null && days <= 1 ? statusColors.error : statusColors.warning;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const summary = useDashboardSummary();
  const expiring = useExpiringProducts();

  return (
    <>
      <Box
        sx={{
          background: gradients.hero, color: '#fff', borderRadius: 5, p: { xs: 3, md: 4 }, mb: 3, position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap',
          boxShadow: '0 12px 32px rgba(37,99,235,0.28)',
          '&::after': { content: '""', position: 'absolute', right: -60, top: -80, width: 260, height: 260, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)' },
          '&::before': { content: '""', position: 'absolute', right: 120, bottom: -110, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" component="h1" sx={{ color: '#fff' }}>Dashboard</Typography>
          <Typography sx={{ opacity: 0.88, mt: 0.5 }}>Keep track of your products, warranties and bills</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/new')}
          sx={{ position: 'relative', zIndex: 1, background: '#fff', color: 'primary.dark', boxShadow: '0 6px 16px rgba(0,0,0,0.15)', '&:hover': { background: '#f1f5ff' } }}
        >
          Add Product
        </Button>
      </Box>

      {summary.isLoading ? <Loading label="Loading dashboard..." /> : summary.isError ? (
        <ErrorState error={summary.error} onRetry={() => summary.refetch()} />
      ) : summary.data && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            <StatCard value={summary.data.totalProducts} label="Total Products" icon={<Inventory2Outlined />} tone={statusColors.info} to="/products" />
            <StatCard value={summary.data.activeWarranty} label="Active Warranty" icon={<VerifiedUserOutlined />} tone={statusColors.success} to="/products?status=ACTIVE" />
            <StatCard value={summary.data.expiringSoon} label="Expiring Soon" icon={<AccessTimeOutlined />} tone={statusColors.warning} to="/products?status=EXPIRING_SOON" />
            <StatCard value={summary.data.expired} label="Expired" icon={<CancelOutlined />} tone={statusColors.error} to="/products?status=EXPIRED" />
          </Box>
          <Box sx={{ mb: 3 }}><HealthBar summary={summary.data} /></Box>
        </>
      )}

      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Expiring Soon</Typography>
          <Link component={RouterLink} to="/products?status=EXPIRING_SOON" underline="hover" variant="body2" sx={{ fontWeight: 700 }}>
            View All →
          </Link>
        </Box>
        {expiring.isLoading ? <Loading label="Loading products..." /> : expiring.isError ? (
          <ErrorState error={expiring.error} onRetry={() => expiring.refetch()} />
        ) : expiring.data && expiring.data.length > 0 ? (
          <Box component="ul" sx={{ m: 0, p: 0 }}>
            {expiring.data.map((p, i) => {
              const tone = dayPill(p.daysUntilExpiry);
              return (
                <Box
                  component="li"
                  key={p.id}
                  sx={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderTop: i === 0 ? 0 : 1, borderColor: 'divider' }}
                >
                  <ProductAvatar name={p.name} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Link component={RouterLink} to={`/products/${p.id}`} underline="hover" color="text.primary" sx={{ fontWeight: 600 }}>{p.name}</Link>
                    <Typography variant="caption" color="text.secondary" display="block">{p.categoryName}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Box component="span" sx={{ display: 'inline-block', px: 1.25, py: 0.35, borderRadius: 99, bgcolor: tone.bg, color: tone.fg, fontWeight: 700, fontSize: '0.78rem' }}>
                      {describeExpiry(p.daysUntilExpiry)}
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>{formatDate(p.warrantyExpiryDate)}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <EmptyState title="Nothing is expiring soon" description="Products whose warranty ends within 7 days will show up here." icon={<CheckCircleOutline fontSize="large" />} />
        )}
      </Card>
    </>
  );
}
