import { apiRequest } from '@/lib/apiClient';
import type { NotificationItem, NotificationListResponse } from '@/types';

export const fetchNotifications = (params: { page?: number; limit?: number; onlyUnread?: boolean } = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.onlyUnread) query.set('onlyUnread', 'true');

  const queryString = query.toString();
  return apiRequest<NotificationListResponse>(`/notifications${queryString ? `?${queryString}` : ''}`);
};

export const fetchUnreadCount = () => apiRequest<{ unreadCount: number }>('/notifications/unread-count');

export const markNotificationRead = (notificationId: string) =>
  apiRequest<NotificationItem>(`/notifications/${notificationId}/read`, { method: 'PATCH' });

export const markAllNotificationsRead = () =>
  apiRequest<{ modifiedCount: number; unreadCount: number }>('/notifications/read-all', { method: 'PATCH' });
