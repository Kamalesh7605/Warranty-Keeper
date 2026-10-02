import type { AppNotification } from '../types/notification';
import { api } from './api';

export const notificationApi = {
  list: () => api.get<AppNotification[]>('/notifications').then((r) => r.data),
  markRead: (id: number) => api.put<AppNotification>(`/notifications/${id}/read`).then((r) => r.data),
};
