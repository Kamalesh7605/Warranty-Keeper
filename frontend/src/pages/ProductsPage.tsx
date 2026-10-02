import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, InputAdornment, MenuItem, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../components/Common/EmptyState';
import { ErrorState } from '../components/Common/ErrorState';
import { PageHeader } from '../components/Common/PageHeader';
import { Loading } from '../components/Loading/Loading';
import { ProductTable } from '../components/ProductTable/ProductTable';
import { useCategories } from '../features/categories/hooks';
import { DeleteProductDialog } from '../features/products/DeleteProductDialog';
import { useProducts } from '../features/products/hooks';
import type { Product, WarrantyStatus } from '../types/product';

const STATUS_OPTIONS: { value: WarrantyStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRING_SOON', label: 'Expiring Soon' },
  { value: 'EXPIRED', label: 'Expired' },
];

export function ProductsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<string>(params.get('status') ?? '');
  const [toDelete, setToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const categories = useCategories();
  const products = useProducts({
    search: debouncedSearch || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    status: (status || undefined) as WarrantyStatus | undefined,
  });
  const filtered = Boolean(debouncedSearch || categoryId || status);
  const addButton = <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/products/new')}>Add Product</Button>;

  return (
    <>
      <PageHeader title="My Products" subtitle="View and manage your products and warranties" action={addButton} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' }, gap: 1.5, mb: 2 }}>
        <TextField
          placeholder="Search products, brand, model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            htmlInput: { 'aria-label': 'Search products' },
            input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> },
          }}
          sx={{ bgcolor: 'background.paper' }}
        />
        <TextField select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} slotProps={{ htmlInput: { 'aria-label': 'Filter by category' }, select: { displayEmpty: true } }} sx={{ bgcolor: 'background.paper' }}>
          <MenuItem value="">All Categories</MenuItem>
          {categories.data?.map((c) => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
        </TextField>
        <TextField select value={status} onChange={(e) => setStatus(e.target.value)} slotProps={{ htmlInput: { 'aria-label': 'Filter by status' }, select: { displayEmpty: true } }} sx={{ bgcolor: 'background.paper' }}>
          <MenuItem value="">All Status</MenuItem>
          {STATUS_OPTIONS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
        </TextField>
      </Box>

      {products.isLoading ? <Loading label="Loading products..." /> : products.isError ? (
        <ErrorState error={products.error} onRetry={() => products.refetch()} />
      ) : products.data && products.data.length > 0 ? (
        <ProductTable products={products.data} onDelete={setToDelete} />
      ) : filtered ? (
        <EmptyState title="No products found." description="Try changing your search or filters." />
      ) : (
        <EmptyState title="No products found." description="Add your first product to start tracking warranties." action={addButton} />
      )}

      <DeleteProductDialog product={toDelete} onClose={() => setToDelete(null)} />
    </>
  );
}
