import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../../services/documentApi';
import { productApi } from '../../services/productApi';
import type { DocumentType } from '../../types/document';
import type { ProductFilters, ProductRequest } from '../../types/product';

export const productKeys = {
  all: ['products'] as const,
  list: (filters: ProductFilters) => ['products', 'list', filters] as const,
  detail: (id: number) => ['products', 'detail', id] as const,
  documents: (id: number) => ['products', 'documents', id] as const,
};

/** Product changes affect the dashboard numbers, notifications and categories' product counts. */
function useInvalidateAll() {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: productKeys.all }),
    qc.invalidateQueries({ queryKey: ['dashboard'] }),
    qc.invalidateQueries({ queryKey: ['categories'] }),
  ]);
}

export const useProducts = (filters: ProductFilters) =>
  useQuery({ queryKey: productKeys.list(filters), queryFn: () => productApi.list(filters) });

export const useProduct = (id: number) =>
  useQuery({ queryKey: productKeys.detail(id), queryFn: () => productApi.get(id), enabled: Number.isFinite(id) });

export function useCreateProduct() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (body: ProductRequest) => productApi.create(body), onSuccess: invalidate });
}

export function useUpdateProduct(id: number) {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (body: ProductRequest) => productApi.update(id, body), onSuccess: invalidate });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (id: number) => productApi.remove(id), onSuccess: invalidate });
}

export const useDocuments = (productId: number) =>
  useQuery({
    queryKey: productKeys.documents(productId),
    queryFn: () => documentApi.list(productId),
    enabled: Number.isFinite(productId),
  });

export function useUploadDocument(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType: DocumentType }) =>
      documentApi.upload(productId, file, documentType),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.documents(productId) }),
  });
}

export function useDeleteDocument(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => documentApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.documents(productId) }),
  });
}
