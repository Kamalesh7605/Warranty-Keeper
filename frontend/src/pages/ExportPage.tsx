import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import FilterAltOffOutlined from '@mui/icons-material/FilterAltOffOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box, Button, Card, InputAdornment, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, TextField, Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { EmptyState } from '../components/Common/EmptyState';
import { ErrorState } from '../components/Common/ErrorState';
import { PageHeader } from '../components/Common/PageHeader';
import { ProductAvatar } from '../components/Common/ProductAvatar';
import { useToast } from '../components/Common/ToastProvider';
import { Loading } from '../components/Loading/Loading';
import { WarrantyStatusBadge } from '../components/WarrantyStatus/WarrantyStatusBadge';
import { useCategories } from '../features/categories/hooks';
import { useProducts } from '../features/products/hooks';
import { getErrorMessage } from '../services/api';
import { productApi } from '../services/productApi';
import type { ProductFilters, WarrantyStatus } from '../types/product';
import { formatDate, formatPrice } from '../utils/format';

const STATUS_OPTIONS: { value: WarrantyStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRING_SOON', label: 'Expiring Soon' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'NO_WARRANTY', label: 'No Warranty' },
];

const dateProps = { inputLabel: { shrink: true } } as const;

interface FormState {
  search: string;
  categoryId: string;
  status: string;
  purchaseFrom: string;
  purchaseTo: string;
  expiryFrom: string;
  expiryTo: string;
}

const EMPTY: FormState = { search: '', categoryId: '', status: '', purchaseFrom: '', purchaseTo: '', expiryFrom: '', expiryTo: '' };

function toFilters(f: FormState): ProductFilters {
  return {
    search: f.search.trim() || undefined,
    categoryId: f.categoryId ? Number(f.categoryId) : undefined,
    status: (f.status || undefined) as WarrantyStatus | undefined,
    purchaseFrom: f.purchaseFrom || undefined,
    purchaseTo: f.purchaseTo || undefined,
    expiryFrom: f.expiryFrom || undefined,
    expiryTo: f.expiryTo || undefined,
  };
}

export function ExportPage() {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Apply filters shortly after the user stops typing / changing them.
  useEffect(() => {
    const t = setTimeout(() => { setFilters(toFilters(form)); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [form]);

  const set = (key: keyof FormState) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const categories = useCategories();
  const products = useProducts(filters);
  const total = useProducts({});
  const filtered = Object.values(filters).some((v) => v !== undefined);
  const rows = products.data ?? [];
  const invalidRange = (a: string, b: string) => a !== '' && b !== '' && a > b;
  const rangeError = invalidRange(form.purchaseFrom, form.purchaseTo) || invalidRange(form.expiryFrom, form.expiryTo);

  const download = async () => {
    setBusy(true);
    try {
      const { blob, filename } = await productApi.exportCsv(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} ${rows.length === 1 ? 'product' : 'products'}.`);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to export products.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Export"
        subtitle="Filter your products, then download exactly what you see as a CSV file"
        action={
          <Button variant="contained" startIcon={<FileDownloadOutlined />} onClick={download} disabled={busy || rows.length === 0 || rangeError}>
            {busy ? 'Preparing...' : `Export CSV (${rows.length})`}
          </Button>
        }
      />

      <Card sx={{ p: { xs: 2, md: 2.5 }, mb: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '2fr 1fr 1fr' }, gap: 1.5 }}>
          <TextField
            placeholder="Search name, brand, model, serial..."
            value={form.search}
            onChange={set('search')}
            slotProps={{
              htmlInput: { 'aria-label': 'Search products' },
              input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> },
            }}
            sx={{ gridColumn: { sm: '1 / -1', lg: 'auto' } }}
          />
          <TextField select value={form.categoryId} onChange={set('categoryId')} slotProps={{ htmlInput: { 'aria-label': 'Filter by category' }, select: { displayEmpty: true } }}>
            <MenuItem value="">All Categories</MenuItem>
            {categories.data?.map((c) => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
          </TextField>
          <TextField select value={form.status} onChange={set('status')} slotProps={{ htmlInput: { 'aria-label': 'Filter by status' }, select: { displayEmpty: true } }}>
            <MenuItem value="">All Status</MenuItem>
            {STATUS_OPTIONS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </TextField>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr) auto' }, gap: 1.5, mt: 1.5, alignItems: 'start' }}>
          <TextField type="date" label="Purchased from" value={form.purchaseFrom} onChange={set('purchaseFrom')} slotProps={dateProps} />
          <TextField type="date" label="Purchased to" value={form.purchaseTo} onChange={set('purchaseTo')} slotProps={dateProps}
            error={invalidRange(form.purchaseFrom, form.purchaseTo)} helperText={invalidRange(form.purchaseFrom, form.purchaseTo) ? 'Must be after "from"' : undefined} />
          <TextField type="date" label="Expires from" value={form.expiryFrom} onChange={set('expiryFrom')} slotProps={dateProps} />
          <TextField type="date" label="Expires to" value={form.expiryTo} onChange={set('expiryTo')} slotProps={dateProps}
            error={invalidRange(form.expiryFrom, form.expiryTo)} helperText={invalidRange(form.expiryFrom, form.expiryTo) ? 'Must be after "from"' : undefined} />
          <Button color="inherit" startIcon={<FilterAltOffOutlined />} onClick={() => setForm(EMPTY)} disabled={!Object.values(form).some(Boolean)} sx={{ height: 40, whiteSpace: 'nowrap', gridColumn: { xs: '1 / -1', lg: 'auto' } }}>
            Clear filters
          </Button>
        </Box>
      </Card>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, px: 0.5 }} aria-live="polite">
        {products.isSuccess && `Showing ${rows.length} of ${total.data?.length ?? rows.length} products${filtered ? ' (filtered)' : ''}`}
      </Typography>

      {products.isLoading ? <Loading label="Loading products..." /> : products.isError ? (
        <ErrorState error={products.error} onRetry={() => products.refetch()} />
      ) : rows.length === 0 ? (
        <Card><EmptyState title="No products match these filters." description="Change or clear the filters to see products to export." /></Card>
      ) : (
        <Card>
          <TableContainer>
            <Table aria-label="Products to export" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Category</TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Purchase Date</TableCell>
                  <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Price</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Expiry Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <ProductAvatar name={p.name} size={34} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Typography>
                          {p.brand && <Typography variant="caption" color="text.secondary">{p.brand}</Typography>}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{p.categoryName}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{formatDate(p.purchaseDate)}</TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{formatPrice(p.purchasePrice)}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{formatDate(p.warrantyExpiryDate)}</TableCell>
                    <TableCell><WarrantyStatusBadge status={p.warrantyStatus} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Card>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, px: 0.5 }}>
        The CSV contains all matching products (not just this page) with every field: name, brand, model, serial number, category, dates, price, status, store and notes.
      </Typography>
    </>
  );
}
