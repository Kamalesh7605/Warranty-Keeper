import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { useToast } from '../../components/Common/ToastProvider';
import { getErrorMessage } from '../../services/api';
import type { Product } from '../../types/product';
import { useDeleteProduct } from './hooks';

interface Props {
  product: Product | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteProductDialog({ product, onClose, onDeleted }: Props) {
  const toast = useToast();
  const remove = useDeleteProduct();

  const confirm = async () => {
    if (!product) return;
    try {
      await remove.mutateAsync(product.id);
      toast.success('Product deleted successfully.');
      onClose();
      onDeleted?.();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to delete product.'));
      onClose();
    }
  };

  return (
    <ConfirmDialog open={Boolean(product)} title="Delete Product?" loading={remove.isPending} onCancel={onClose} onConfirm={confirm}>
      Are you sure you want to delete {product?.name}?<br />This action cannot be undone.
    </ConfirmDialog>
  );
}
