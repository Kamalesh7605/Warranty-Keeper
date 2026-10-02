import type { DashboardSummary, Product, ProductFilters, ProductLookup, ProductRequest } from '../types/product';
import { api } from './api';

export const productApi = {
  list: (filters: ProductFilters = {}) =>
    api.get<Product[]>('/products', { params: filters }).then((r) => r.data),
  get: (id: number) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (body: ProductRequest) => api.post<Product>('/products', body).then((r) => r.data),
  update: (id: number, body: ProductRequest) => api.put<Product>(`/products/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/products/${id}`).then(() => undefined),
  lookup: (barcode: string) =>
    api.get<ProductLookup>('/products/lookup', { params: { barcode } }).then((r) => r.data),
  exportCsv: async (filters: ProductFilters = {}) => {
    const res = await api.get<Blob>('/products/export', { params: filters, responseType: 'blob' });
    const header: string = res.headers['content-disposition'] ?? '';
    const match = /filename="?([^";]+)"?/.exec(header);
    return { blob: res.data, filename: match?.[1] ?? 'warranty-products.csv' };
  },
  dashboardSummary: () => api.get<DashboardSummary>('/dashboard/summary').then((r) => r.data),
  dashboardExpiring: () => api.get<Product[]>('/dashboard/expiring').then((r) => r.data),
};
