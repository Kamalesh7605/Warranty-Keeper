import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '../components/Common/ErrorState';
import { PageHeader } from '../components/Common/PageHeader';
import { useToast } from '../components/Common/ToastProvider';
import { ProductDocuments } from '../components/DocumentUpload/ProductDocuments';
import { Loading } from '../components/Loading/Loading';
import { useCategories } from '../features/categories/hooks';
import { useProduct, useUpdateProduct } from '../features/products/hooks';
import { ProductForm } from '../features/products/ProductForm';
import { productToFormValues, toProductRequest, type ProductFormValues } from '../features/products/productSchema';
import { getErrorMessage } from '../services/api';

export function EditProductPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const toast = useToast();
  const product = useProduct(id);
  const categories = useCategories();
  const update = useUpdateProduct(id);

  const submit = async (values: ProductFormValues) => {
    try {
      await update.mutateAsync(toProductRequest(values));
      toast.success('Product updated successfully.');
      navigate(`/products/${id}`);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to update product.'));
    }
  };

  if (product.isLoading || categories.isLoading) return <Loading label="Loading product..." />;
  if (product.isError) return <ErrorState error={product.error} onRetry={() => product.refetch()} />;
  if (categories.isError) return <ErrorState error={categories.error} onRetry={() => categories.refetch()} />;
  if (!product.data) return null;

  return (
    <>
      <PageHeader title="Edit Product" subtitle="Update product details" />
      <ProductForm
        defaultValues={productToFormValues(product.data)}
        categories={categories.data ?? []}
        submitLabel="Update Product"
        submitting={update.isPending}
        onSubmit={submit}
        onCancel={() => navigate(`/products/${id}`)}
        documents={<ProductDocuments productId={id} pickerVariant="cards" />}
      />
    </>
  );
}
