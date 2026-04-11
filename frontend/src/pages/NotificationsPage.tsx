import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, CheckCheck, Ticket, Inbox,
  MessageSquare, ShieldCheck, UserPlus, UserCog,
  AlertOctagon, ArrowUpRight,
  CalendarPlus, CalendarCheck, CalendarX, CalendarMinus,
} from 'lucide-react';
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
  greenSoft:'rgba(45,122,58,0.14)',
  amber:    '#B45309',
  amberDim: 'rgba(180,83,9,0.07)',
  red:      '#D94444',
  redDim:   'rgba(217,68,68,0.06)',
  blue:     '#2563EB',
  blueDim:  'rgba(37,99,235,0.07)',
};

type IconComp = React.ComponentType<{ size?: number; style?: React.CSSProperties }>;

const TYPE_META: Record<NotificationType, { icon: IconComp; color: string; bg: string; label: string }> = {
  TICKET_CREATED:        { icon: Ticket,        color: C.green, bg: C.greenDim, label: 'New Ticket' },
  TICKET_ASSIGNED:       { icon: ArrowUpRight,  color: C.blue,  bg: C.blueDim,  label: 'Assigned' },
  TICKET_STATUS_CHANGED: { icon: ShieldCheck,   color: C.amber, bg: C.amberDim, label: 'Status' },
  TICKET_COMMENT_ADDED:  { icon: MessageSquare, color: C.green, bg: C.greenDim, label: 'Comment' },
  BOOKING_CREATED:       { icon: CalendarPlus,  color: C.blue,  bg: C.blueDim,  label: 'New Booking' },
  BOOKING_APPROVED:      { icon: CalendarCheck, color: C.green, bg: C.greenDim, label: 'Approved' },
  BOOKING_REJECTED:      { icon: CalendarX,     color: C.red,   bg: C.redDim,   label: 'Rejected' },
  BOOKING_CANCELLED:     { icon: CalendarMinus, color: C.amber, bg: C.amberDim, label: 'Cancelled' },
  USER_REGISTERED:       { icon: UserPlus,      color: C.blue,  bg: C.blueDim,  label: 'Registered' },
  USER_ACTIVATED:        { icon: ShieldCheck,   color: C.green, bg: C.greenDim, label: 'Activated' },
  USER_ROLE_CHANGED:     { icon: UserCog,       color: C.blue,  bg: C.blueDim,  label: 'Role' },
  USER_SUSPENDED:        { icon: AlertOctagon,  color: C.red,   bg: C.redDim,   label: 'Suspended' },
};

type FilterTab = 'all' | 'unread' | 'tickets' | 'bookings' | 'account';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByDate(notifications: NotificationResponse[]): [string, NotificationResponse[]][] {
  const groups = new Map<string, NotificationResponse[]>();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const n of notifications) {
    const d = new Date(n.createdAt).toDateString();
    let label: string;
    if (d === today) label = 'Today';
    else if (d === yesterday) label = 'Yesterday';
    else label = new Date(n.createdAt).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(n);
  }
  return Array.from(groups.entries());
}

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const navigate = useNavigate();

  const filtered = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'tickets') return n.referenceType === 'TICKET';
    if (activeTab === 'bookings') return n.referenceType === 'BOOKING';
    if (activeTab === 'account') return n.referenceType === 'USER';
    return true;
  });

  const grouped = groupByDate(filtered);

  const handleClick = (n: NotificationResponse) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.referenceType === 'TICKET' && n.referenceId) navigate(`/tickets/${n.referenceId}`);
    else if (n.referenceType === 'BOOKING') navigate('/bookings');
    else if (n.referenceType === 'USER' && n.referenceId) navigate('/profile');
  };

  const tabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'tickets', label: 'Tickets' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'account', label: 'Account' },
  ];

  return (
    <div style={{ background: C.bg, fontFamily: 'Albert Sans, sans-serif', minHeight: '100%' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[12px] mt-0.5" style={{ color: C.muted }}>
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: C.green, background: C.greenDim }}
              onMouseEnter={e => { e.currentTarget.style.background = C.greenSoft; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.greenDim; }}
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-lg mb-5"
          style={{ background: C.surface }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150"
              style={{
                background: activeTab === tab.id ? C.card : 'transparent',
                color: activeTab === tab.id ? C.fg : C.muted,
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(26,46,26,0.06)' : 'none',
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: activeTab === tab.id ? C.greenDim : 'rgba(107,123,107,0.1)',
                    color: activeTab === tab.id ? C.green : C.muted,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div
            className="rounded-xl py-16 text-center"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: C.surface }}
            >
              {activeTab === 'unread' ? (
                <CheckCheck size={20} style={{ color: C.green, opacity: 0.5 }} />
              ) : (
                <Inbox size={20} style={{ color: C.muted, opacity: 0.5 }} />
              )}
            </div>
            <p className="text-[13px] font-medium" style={{ color: C.fg }}>
              {activeTab === 'unread' ? 'All caught up' : 'No notifications'}
            </p>
            <p className="text-[11px] mt-1" style={{ color: C.muted }}>
              {activeTab === 'unread'
                ? 'You have no unread notifications'
                : 'Activity will appear here'}
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            {grouped.map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <div
                  className="px-4 py-2 sticky top-0 z-10"
                  style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: C.muted }}>
                    {dateLabel}
                  </p>
                </div>
                {items.map(n => {
                  const meta = TYPE_META[n.type] || TYPE_META.TICKET_CREATED;
                  const Icon = meta.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className="flex items-start gap-3 w-full text-left px-4 py-3.5 transition-colors duration-100"
                      style={{
                        background: n.isRead ? 'transparent' : C.greenDim,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.hover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? 'transparent' : C.greenDim; }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: meta.bg }}
                      >
                        <Icon size={15} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-semibold truncate" style={{ color: C.fg }}>
                            {n.title}
                          </p>
                          <span
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                          {!n.isRead && (
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: C.green }}
                            />
                          )}
                        </div>
                        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: C.muted }}>
                          {n.message}
                        </p>
                        <p className="text-[10px] mt-1.5 tabular-nums" style={{ color: C.muted, opacity: 0.6 }}>
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div
                          className="shrink-0 p-1.5 mt-1 rounded-md transition-colors cursor-pointer"
                          title="Mark as read"
                          onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.greenSoft; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <Check size={13} style={{ color: C.green }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
