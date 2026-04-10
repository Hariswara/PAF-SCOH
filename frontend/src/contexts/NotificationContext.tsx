import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { notificationApi } from '@/lib/notificationApi';
import type { NotificationResponse } from '@/types/notification';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NotificationContextType {
    notifications: NotificationResponse[];
    unreadCount: number;
    isLoading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refresh: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);

    const refresh = useCallback(async () => {
        if (!isAuthenticated || !user || user.status !== 'ACTIVE') return;
        setIsLoading(true);
        try {
            const [all, count] = await Promise.all([
                notificationApi.getAll(),
                notificationApi.getUnreadCount(),
            ]);
            setNotifications(all);
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            const updated = await notificationApi.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? updated : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    }, []);

    // SSE connection
    useEffect(() => {
        if (!isAuthenticated || !user || user.status !== 'ACTIVE') return;

        const connectSse = () => {
            const es = new EventSource('/api/notifications/stream', { withCredentials: true });
            eventSourceRef.current = es;

            es.addEventListener('notification', (event) => {
                try {
                    const notification: NotificationResponse = JSON.parse(event.data);
                    setNotifications(prev => [notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    toast(notification.title, { description: notification.message });
                } catch (err) {
                    console.error('Failed to parse SSE notification:', err);
                }
            });

            es.addEventListener('connected', () => {
                console.debug('SSE notification stream connected');
            });

            es.onerror = () => {
                es.close();
                // Reconnect after 5s
                setTimeout(connectSse, 5000);
            };
        };

        refresh();
        connectSse();

        return () => {
            eventSourceRef.current?.close();
            eventSourceRef.current = null;
        };
    }, [isAuthenticated, user, refresh]);

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refresh }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
