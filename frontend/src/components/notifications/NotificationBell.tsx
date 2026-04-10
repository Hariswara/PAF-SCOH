import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Ticket, UserCircle, ChevronRight } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationResponse, NotificationType } from '@/types/notification';

const C = {
    bg:       '#F8FAF7',
    card:     '#FFFFFF',
    surface:  '#F2F5F0',
    hover:    '#EFF3EC',
    border:   '#E2E8DF',
    fg:       '#1A2E1A',
    muted:    '#6B7B6B',
    green:    '#2D7A3A',
    greenDim: 'rgba(45,122,58,0.08)',
    greenSoft:'rgba(45,122,58,0.15)',
    amber:    '#B45309',
    amberDim: 'rgba(180,83,9,0.08)',
    red:      '#D94444',
    redDim:   'rgba(217,68,68,0.06)',
    blue:     '#2563EB',
    blueDim:  'rgba(37,99,235,0.08)',
};

const TYPE_META: Record<NotificationType, { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string; bg: string }> = {
    TICKET_CREATED:        { icon: Ticket,     color: C.green, bg: C.greenDim },
    TICKET_ASSIGNED:       { icon: Ticket,     color: C.blue,  bg: C.blueDim },
    TICKET_STATUS_CHANGED: { icon: Ticket,     color: C.amber, bg: C.amberDim },
    TICKET_COMMENT_ADDED:  { icon: Ticket,     color: C.green, bg: C.greenDim },
    USER_REGISTERED:       { icon: UserCircle, color: C.green, bg: C.greenDim },
    USER_ACTIVATED:        { icon: UserCircle, color: C.green, bg: C.greenDim },
    USER_ROLE_CHANGED:     { icon: UserCircle, color: C.blue,  bg: C.blueDim },
    USER_SUSPENDED:        { icon: UserCircle, color: C.red,   bg: C.redDim },
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function NotificationItem({
    notification, onRead, onNavigate,
}: {
    notification: NotificationResponse;
    onRead: (id: string) => void;
    onNavigate: (n: NotificationResponse) => void;
}) {
    const meta = TYPE_META[notification.type] || TYPE_META.TICKET_CREATED;
    const Icon = meta.icon;

    return (
        <div
            onClick={() => onNavigate(notification)}
            className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150"
            style={{
                background: notification.isRead ? 'transparent' : C.greenDim,
                borderBottom: `1px solid ${C.border}`,
                fontFamily: 'Albert Sans, sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.hover; }}
            onMouseLeave={e => { e.currentTarget.style.background = notification.isRead ? 'transparent' : C.greenDim; }}
        >
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: meta.bg }}
            >
                <Icon size={14} style={{ color: meta.color }} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-[12px] font-semibold truncate" style={{ color: C.fg }}>
                        {notification.title}
                    </p>
                    {!notification.isRead && (
                        <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: C.green }}
                        />
                    )}
                </div>
                <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: C.muted }}>
                    {notification.message}
                </p>
                <p className="text-[10px] mt-1" style={{ color: C.muted, opacity: 0.7 }}>
                    {timeAgo(notification.createdAt)}
                </p>
            </div>

            {!notification.isRead && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRead(notification.id); }}
                    className="shrink-0 p-1 rounded transition-colors"
                    title="Mark as read"
                    onMouseEnter={e => { e.currentTarget.style.background = C.greenSoft; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                    <Check size={12} style={{ color: C.green }} />
                </button>
            )}
        </div>
    );
}

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleNavigate = (n: NotificationResponse) => {
        if (!n.isRead) markAsRead(n.id);
        setOpen(false);
        if (n.referenceType === 'TICKET' && n.referenceId) {
            navigate(`/tickets/${n.referenceId}`);
        } else if (n.referenceType === 'USER' && n.referenceId) {
            navigate('/profile');
        }
    };

    const recentNotifications = notifications.slice(0, 8);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-lg transition-all duration-150"
                style={{ color: C.muted }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = C.hover;
                    e.currentTarget.style.color = C.fg;
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = C.muted;
                }}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ background: C.green, fontFamily: 'Albert Sans, sans-serif' }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-[360px] rounded-xl overflow-hidden z-50"
                    style={{
                        background: C.card,
                        border: `1px solid ${C.border}`,
                        boxShadow: '0 12px 40px rgba(26,46,26,0.12), 0 4px 12px rgba(26,46,26,0.06)',
                        fontFamily: 'Albert Sans, sans-serif',
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: `1px solid ${C.border}` }}
                    >
                        <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold" style={{ color: C.fg }}>
                                Notifications
                            </p>
                            {unreadCount > 0 && (
                                <span
                                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                    style={{ background: C.greenDim, color: C.green }}
                                >
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-colors"
                                style={{ color: C.green }}
                                onMouseEnter={e => { e.currentTarget.style.background = C.greenDim; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                <CheckCheck size={12} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {recentNotifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell size={24} style={{ color: C.muted, opacity: 0.3, margin: '0 auto 8px' }} />
                                <p className="text-[12px]" style={{ color: C.muted }}>
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            recentNotifications.map(n => (
                                <NotificationItem
                                    key={n.id}
                                    notification={n}
                                    onRead={markAsRead}
                                    onNavigate={handleNavigate}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <button
                            onClick={() => { setOpen(false); navigate('/notifications'); }}
                            className="flex items-center justify-center gap-1 w-full px-4 py-2.5 text-[11px] font-medium transition-colors"
                            style={{ color: C.green, borderTop: `1px solid ${C.border}` }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.greenDim; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            View all notifications
                            <ChevronRight size={12} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
