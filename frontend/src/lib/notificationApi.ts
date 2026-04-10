import api from '@/lib/api';
import type { NotificationResponse } from '@/types/notification';

export const notificationApi = {
    getAll: () =>
        api.get<NotificationResponse[]>('/notifications').then((r) => r.data),

    getUnread: () =>
        api.get<NotificationResponse[]>('/notifications/unread').then((r) => r.data),

    getUnreadCount: () =>
        api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data.count),

    markAsRead: (id: string) =>
        api.patch<NotificationResponse>(`/notifications/${id}/read`).then((r) => r.data),

    markAllAsRead: () =>
        api.post('/notifications/mark-all-read'),
};
