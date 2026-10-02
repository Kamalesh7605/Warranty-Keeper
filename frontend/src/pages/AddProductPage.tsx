import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/Common/PageHeader';
import { useToast } from '../components/Common/ToastProvider';
import { DocumentUpload } from '../components/DocumentUpload/DocumentUpload';
import { Loading } from '../components/Loading/Loading';
import { ErrorState } from '../components/Common/ErrorState';
import { useCategories } from '../features/categories/hooks';
import { BarcodeScanner } from '../features/products/BarcodeScanner';
import { useCreateProduct } from '../features/products/hooks';
import { ProductForm } from '../features/products/ProductForm';
import { prefillToFormValues, toProductRequest, type ProductFormValues } from '../features/products/productSchema';
import { getErrorMessage } from '../services/api';
import { documentApi } from '../services/documentApi';
import type { PendingDocument } from '../types/document';
import type { ProductPrefill } from '../types/product';

type Mode = 'manual' | 'scan';

export function AddProductPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const categories = useCategories();
  const create = useCreateProduct();
  const [mode, setMode] = useState<Mode>('manual');
  const [prefill, setPrefill] = useState<ProductPrefill | undefined>();
  const [pending, setPending] = useState<PendingDocument[]>([]);
  const [saving, setSaving] = useState(false);

  const submit = async (values: ProductFormValues) => {
    setSaving(true);
    try {
      const product = await create.mutateAsync(toProductRequest(values));
      const failed: string[] = [];
      for (const doc of pending) {
        try {
          await documentApi.upload(product.id, doc.file, doc.documentType);
        } catch (e) {
          failed.push(`${doc.file.name} (${getErrorMessage(e, 'upload failed')})`);
        }
      }
      if (failed.length > 0) {
        toast.error(`Product created, but some documents were not uploaded: ${failed.join(', ')}. You can add them from the product page.`);
      } else {
        toast.success('Product created successfully.');
      }
      navigate(`/products/${product.id}`);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to create product.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Add Product"
        subtitle={mode === 'scan' ? 'Scan a barcode or QR code from the product' : 'Add product details manually'}
      />
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={mode}
        onChange={(_, value: Mode | null) => value && setMode(value)}
        color="primary"
        sx={{ mb: 2.5, maxWidth: 560, bgcolor: 'background.paper' }}
        aria-label="Add product method"
      >
        <ToggleButton value="manual" sx={{ gap: 1, py: 1 }}><EditOutlined fontSize="small" /> Manual Entry</ToggleButton>
        <ToggleButton value="scan" sx={{ gap: 1, py: 1 }}><CameraAltOutlined fontSize="small" /> Scan Barcode / QR</ToggleButton>
      </ToggleButtonGroup>

      {mode === 'scan' ? (
        <BarcodeScanner
          onManual={() => setMode('manual')}
          onConfirm={(p) => { setPrefill(p); setMode('manual'); }}
        />
      ) : categories.isLoading ? <Loading label="Loading form..." /> : categories.isError ? (
        <ErrorState error={categories.error} onRetry={() => categories.refetch()} />
      ) : (
        <ProductForm
          // Re-mount when a scan supplies new values so the defaults apply.
          key={prefill?.barcode ?? 'blank'}
          defaultValues={prefillToFormValues(prefill)}
          categories={categories.data ?? []}
          submitLabel="Save Product"
          submitting={saving}
          onSubmit={submit}
          onCancel={() => navigate('/products')}
          documents={<DocumentUpload pending={pending} onChange={setPending} disabled={saving} />}
        />
      )}
    </>
  );
}
