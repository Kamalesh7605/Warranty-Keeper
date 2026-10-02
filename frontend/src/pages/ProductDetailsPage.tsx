import ArrowBack from '@mui/icons-material/ArrowBack';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import { Box, Button, Card, Tab, Tabs, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '../components/Common/ErrorState';
import { ProductAvatar } from '../components/Common/ProductAvatar';
import { ProductDocuments } from '../components/DocumentUpload/ProductDocuments';
import { Loading } from '../components/Loading/Loading';
import { WarrantyStatusBadge } from '../components/WarrantyStatus/WarrantyStatusBadge';
import { DeleteProductDialog } from '../features/products/DeleteProductDialog';
import { useProduct } from '../features/products/hooks';
import { statusColors } from '../theme/theme';
import type { Product, WarrantyStatus } from '../types/product';
import { describeExpiry, formatDate, formatPrice } from '../utils/format';

function InfoRows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'minmax(110px, 38%) 1fr', rowGap: 1.25, columnGap: 2 }}>
      {rows.map(([label, value]) => (
        <Box key={label} sx={{ display: 'contents' }}>
          <Typography component="dt" variant="body2" color="text.secondary">{label}</Typography>
          <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 500, wordBreak: 'break-word' }}>{value || '—'}</Typography>
        </Box>
      ))}
    </Box>
  );
}

const BANNER_TONE: Record<WarrantyStatus, keyof typeof statusColors> = {
  ACTIVE: 'success', EXPIRING_SOON: 'warning', EXPIRES_TODAY: 'warning', EXPIRED: 'error', NO_WARRANTY: 'neutral',
};

function ExpiryBanner({ product }: { product: Product }) {
  if (product.warrantyStatus === 'NO_WARRANTY') return null;
  const tone = statusColors[BANNER_TONE[product.warrantyStatus]];
  const title = product.warrantyStatus === 'ACTIVE'
    ? `Active until ${formatDate(product.warrantyExpiryDate)}`
    : describeExpiry(product.daysUntilExpiry);
  return (
    <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderRadius: 3, bgcolor: tone.bg, color: tone.fg, minWidth: { md: 240 } }}>
      <AccessTimeOutlined fontSize="large" />
      <Box>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
        {product.warrantyStatus !== 'ACTIVE' && (
          <Typography variant="body2">{formatDate(product.warrantyExpiryDate)}</Typography>
        )}
      </Box>
    </Box>
  );
}

export function ProductDetailsPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);
  const [tab, setTab] = useState<'overview' | 'documents'>('overview');
  const [deleting, setDeleting] = useState(false);

  if (isLoading) return <Loading label="Loading product..." />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!product) return null;

  const period = product.warrantyPeriod
    ? `${product.warrantyPeriod} ${product.warrantyPeriodUnit === 'YEARS' ? (product.warrantyPeriod === 1 ? 'Year' : 'Years') : (product.warrantyPeriod === 1 ? 'Month' : 'Months')}`
    : null;

  return (
    <>
      <Button component={RouterLink} to="/products" startIcon={<ArrowBack />} color="inherit" sx={{ mb: 1.5 }}>
        Back to Products
      </Button>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: 0 }}>
          <ProductAvatar name={product.name} size={68} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" component="h1" sx={{ wordBreak: 'break-word' }}>{product.name}</Typography>
            <Typography color="text.secondary" variant="body2">
              {[product.brand, product.categoryName].filter(Boolean).join(' | ')}
            </Typography>
            <Box sx={{ mt: 0.75 }}><WarrantyStatusBadge status={product.warrantyStatus} /></Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignSelf: 'flex-start' }}>
          <Button variant="outlined" startIcon={<EditOutlined />} component={RouterLink} to={`/products/${product.id}/edit`}>Edit</Button>
          <Button variant="contained" color="error" startIcon={<DeleteOutline />} onClick={() => setDeleting(true)}>Delete</Button>
        </Box>
      </Box>

      <ExpiryBanner product={product} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 2, mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="overview" label="Overview" />
        <Tab value="documents" label="Documents" />
      </Tabs>

      {tab === 'overview' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'start' }}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Product Information</Typography>
            <InfoRows rows={[
              ['Product Name', product.name],
              ['Brand', product.brand],
              ['Model Number', product.modelNumber],
              ['Serial Number', product.serialNumber],
              ['Barcode / QR', product.barcode],
              ['Category', product.categoryName],
              ['Purchase Date', formatDate(product.purchaseDate)],
              ['Purchase Price', formatPrice(product.purchasePrice)],
              ['Store / Seller', product.storeSeller],
              ['Notes', product.notes],
            ]} />
          </Card>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Card sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Warranty Information</Typography>
              <InfoRows rows={[
                ['Warranty Period', period],
                ['Start Date', formatDate(product.warrantyStartDate)],
                ['Expiry Date', formatDate(product.warrantyExpiryDate)],
                ['Status', <WarrantyStatusBadge key="s" status={product.warrantyStatus} />],
              ]} />
            </Card>
            <Card sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Documents</Typography>
              <ProductDocuments productId={product.id} />
            </Card>
          </Box>
        </Box>
      ) : (
        <Card sx={{ p: 2.5, maxWidth: 720 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Documents</Typography>
          <ProductDocuments productId={product.id} pickerVariant="cards" />
        </Card>
      )}

      <DeleteProductDialog product={deleting ? product : null} onClose={() => setDeleting(false)} onDeleted={() => navigate('/products')} />
    </>
  );
}
