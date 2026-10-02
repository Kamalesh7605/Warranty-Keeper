export interface AppNotification {
  id: number;
  productId: number;
  type: 'WARRANTY_EXPIRING';
  message: string;
  notificationDate: string;
  read: boolean;
  createdAt: string;
}
