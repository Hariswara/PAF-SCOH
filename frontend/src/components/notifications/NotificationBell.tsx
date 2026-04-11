import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Ticket, UserCog,
  ChevronRight, MessageSquare, ShieldCheck, UserPlus, AlertOctagon,
  ArrowUpRight, Inbox, CalendarPlus, CalendarCheck, CalendarX, CalendarMinus,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationResponse, NotificationType } from '@/types/notification';

const C = {
  card:     '#FFFFFF',
  surface:  '#F2F5F0',
  hover:    '#EFF3EC',
  border:   '#E2E8DF',
  fg:       '#1A2E1A',
  muted:    '#6B7B6B',
  green:    '#2D7A3A',
  greenDim: 'rgba(45,122,58,0.08)',
  greenSoft:'rgba(45,122,58,0.14)',
  amber:    '#B45309',
  amberDim: 'rgba(180,83,9,0.07)',
  red:      '#D94444',
  redDim:   'rgba(217,68,68,0.06)',
  blue:     '#2563EB',
  blueDim:  'rgba(37,99,235,0.07)',
};

type IconComp = React.ComponentType<{ size?: number; style?: React.CSSProperties }>;

const TYPE_META: Record<NotificationType, { icon: IconComp; color: string; bg: string }> = {
  TICKET_CREATED:        { icon: Ticket,        color: C.green, bg: C.greenDim },
  TICKET_ASSIGNED:       { icon: ArrowUpRight,  color: C.blue,  bg: C.blueDim },
  TICKET_STATUS_CHANGED: { icon: ShieldCheck,   color: C.amber, bg: C.amberDim },
  TICKET_COMMENT_ADDED:  { icon: MessageSquare, color: C.green, bg: C.greenDim },
  BOOKING_CREATED:       { icon: CalendarPlus,  color: C.blue,  bg: C.blueDim },
  BOOKING_APPROVED:      { icon: CalendarCheck, color: C.green, bg: C.greenDim },
  BOOKING_REJECTED:      { icon: CalendarX,     color: C.red,   bg: C.redDim },
  BOOKING_CANCELLED:     { icon: CalendarMinus, color: C.amber, bg: C.amberDim },
  USER_REGISTERED:       { icon: UserPlus,      color: C.blue,  bg: C.blueDim },
  USER_ACTIVATED:        { icon: ShieldCheck,   color: C.green, bg: C.greenDim },
  USER_ROLE_CHANGED:     { icon: UserCog,       color: C.blue,  bg: C.blueDim },
  USER_SUSPENDED:        { icon: AlertOctagon,  color: C.red,   bg: C.redDim },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function NotificationRow({
  notification, onRead, onNavigate,
}: {
  notification: NotificationResponse;
  onRead: (id: string) => void;
  onNavigate: (n: NotificationResponse) => void;
}) {
  const meta = TYPE_META[notification.type] || TYPE_META.TICKET_CREATED;
  const Icon = meta.icon;

  return (
    <button
      onClick={() => onNavigate(notification)}
      className="flex items-start gap-3 w-full text-left px-4 py-3 transition-colors duration-100"
      style={{
        background: notification.isRead ? 'transparent' : C.greenDim,
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
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] font-semibold truncate" style={{ color: C.fg }}>
            {notification.title}
          </p>
          <span className="text-[10px] shrink-0 tabular-nums" style={{ color: C.muted, opacity: 0.7 }}>
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="text-[11px] mt-0.5 line-clamp-2 leading-relaxed" style={{ color: C.muted }}>
          {notification.message}
        </p>
      </div>

      {!notification.isRead && (
        <div
          className="shrink-0 mt-2 w-2 h-2 rounded-full"
          style={{ background: C.green }}
          onClick={(e) => { e.stopPropagation(); onRead(notification.id); }}
          title="Mark as read"
        />
      )}
    </button>
  );
}

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  const handleNavigate = (n: NotificationResponse) => {
    if (!n.isRead) markAsRead(n.id);
    close();
    if (n.referenceType === 'TICKET' && n.referenceId) navigate(`/tickets/${n.referenceId}`);
    else if (n.referenceType === 'BOOKING') navigate('/bookings');
    else if (n.referenceType === 'USER' && n.referenceId) navigate('/profile');
  };

  const recent = notifications.slice(0, 6);

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150"
        style={{ color: C.muted }}
        onMouseEnter={e => {
          e.currentTarget.style.background = C.hover;
          e.currentTarget.style.color = C.fg;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = open ? C.hover : 'transparent';
          e.currentTarget.style.color = open ? C.fg : C.muted;
        }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={17} strokeWidth={2} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[14px] h-[14px] px-[3px] rounded-full flex items-center justify-center text-[8px] font-bold text-white leading-none"
            style={{ background: C.green, fontFamily: 'Albert Sans, sans-serif' }}
          >
            {unreadCount > 99 ? '99' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[380px] rounded-xl overflow-hidden z-[60]"
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            boxShadow: '0 20px 60px rgba(26,46,26,0.14), 0 8px 24px rgba(26,46,26,0.08)',
            fontFamily: 'Albert Sans, sans-serif',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2.5">
              <p className="text-[13px] font-semibold" style={{ color: C.fg }}>
                Notifications
              </p>
              {unreadCount > 0 && (
                <span
                  className="text-[10px] font-bold px-2 py-[2px] rounded-full"
                  style={{ background: C.greenDim, color: C.green }}
                >
                  {unreadCount}
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
                <CheckCheck size={13} />
                Read all
              </button>
            )}
          </div>

          {/* List */}
          <div
            className="max-h-[380px] overflow-y-auto divide-y"
            style={{ scrollbarWidth: 'thin', borderColor: C.border }}
          >
            {recent.length === 0 ? (
              <div className="py-14 flex flex-col items-center">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: C.surface }}
                >
                  <Inbox size={18} style={{ color: C.muted, opacity: 0.4 }} />
                </div>
                <p className="text-[12px] font-medium" style={{ color: C.fg }}>
                  No notifications
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                  You're all caught up
                </p>
              </div>
            ) : (
              recent.map(n => (
                <NotificationRow
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
              onClick={() => { close(); navigate('/notifications'); }}
              className="flex items-center justify-center gap-1 w-full px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors"
              style={{ color: C.green, borderTop: `1px solid ${C.border}` }}
              onMouseEnter={e => { e.currentTarget.style.background = C.greenDim; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              View all
              <ChevronRight size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
