import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../services/notificationApi';

export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: notificationApi.list, refetchInterval: 60_000 });

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
