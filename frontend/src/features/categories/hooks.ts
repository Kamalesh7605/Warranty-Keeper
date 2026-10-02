import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../../services/categoryApi';
import type { CategoryRequest } from '../../types/category';

export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: categoryApi.list });

export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: CategoryRequest }) =>
      id ? categoryApi.update(id, body) : categoryApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reassignTo }: { id: number; reassignTo?: number }) => categoryApi.remove(id, reassignTo),
    onSuccess: () => Promise.all([
      qc.invalidateQueries({ queryKey: ['categories'] }),
      qc.invalidateQueries({ queryKey: ['products'] }),
    ]),
  });
}
