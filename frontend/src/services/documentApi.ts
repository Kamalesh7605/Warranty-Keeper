import type { DocumentType, ProductDocument } from '../types/document';
import { API_BASE_URL, api } from './api';

export const documentApi = {
  list: (productId: number) =>
    api.get<ProductDocument[]>(`/products/${productId}/documents`).then((r) => r.data),
  upload: (productId: number, file: File, documentType: DocumentType) => {
    const form = new FormData();
    form.append('file', file);
    form.append('documentType', documentType);
    return api.post<ProductDocument>(`/products/${productId}/documents`, form).then((r) => r.data);
  },
  remove: (id: number) => api.delete(`/documents/${id}`).then(() => undefined),
  downloadUrl: (id: number) => `${API_BASE_URL}/documents/${id}/download`,
  viewUrl: (id: number) => `${API_BASE_URL}/documents/${id}/download?inline=true`,
};
