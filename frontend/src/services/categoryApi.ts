import type { Category, CategoryRequest } from '../types/category';
import { api } from './api';

export const categoryApi = {
  list: () => api.get<Category[]>('/categories').then((r) => r.data),
  create: (body: CategoryRequest) => api.post<Category>('/categories', body).then((r) => r.data),
  update: (id: number, body: CategoryRequest) => api.put<Category>(`/categories/${id}`, body).then((r) => r.data),
  remove: (id: number, reassignTo?: number) =>
    api.delete(`/categories/${id}`, { params: reassignTo ? { reassignTo } : undefined }).then(() => undefined),
};
