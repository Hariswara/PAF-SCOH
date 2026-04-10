import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, BookMarked, CalendarCheck, Ticket,
  Users, Globe2, ShieldAlert, UserCircle, LogOut, Menu, X,
  ChevronRight, GraduationCap,
} from 'lucide-react';

const C = {
  bg:         '#F8FAF7',
  card:       '#FFFFFF',
  surface:    '#F2F5F0',
  hover:      '#EFF3EC',
  border:     '#E2E8DF',
  fg:         '#1A2E1A',
  muted:      '#6B7B6B',
  green:      '#2D7A3A',
  greenDim:   'rgba(45,122,58,0.08)',
};

const ROLE_META: Record<string, { label: string; color: string }> = {
  STUDENT:      { label: 'Student',      color: '#2D7A3A' },
  DOMAIN_ADMIN: { label: 'Domain Admin', color: '#7B6BA5' },
  TECHNICIAN:   { label: 'Technician',   color: '#8B7BB5' },
  SUPER_ADMIN:  { label: 'Super Admin',  color: '#2D7A3A' },
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const coreNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Resources', href: '/resources', icon: BookMarked      },
  { label: 'Bookings',  href: '/bookings',  icon: CalendarCheck   },
  { label: 'Tickets',   href: '/tickets',   icon: Ticket          },
];

const adminNav: NavItem[] = [
  { label: 'Personnel', href: '/admin/users',   icon: Users       },
  { label: 'Domains',   href: '/admin/domains', icon: Globe2       },
  { label: 'Audit Log', href: '/admin/audit',   icon: ShieldAlert  },
];

function NavLink({
  item, active, onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className="relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all duration-150 select-none"
      style={{
        background:    active ? C.greenDim : 'transparent',
        color:         active ? C.green    : C.muted,
        fontFamily:    'Albert Sans, sans-serif',
        fontWeight:    active ? 600 : 400,
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = C.hover;
          e.currentTarget.style.color      = C.fg;
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color      = C.muted;
        }
      }}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full"
          style={{ background: C.green }}
        />
      )}
      <div style={{ color: active ? C.green : C.muted }}>
        <item.icon
          size={15}
          className="shrink-0"
        />
      </div>
      
      {item.label}
      {active && (
        <ChevronRight
         size={12}
         className="ml-auto opacity-50"
         color={C.green}
        />
      )}
    </Link>
  );
}

interface AppLayoutProps { children: React.ReactNode; }

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const active = (href: string) => location.pathname === href;
  const roleMeta = user?.role ? ROLE_META[user.role] : undefined;
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const SidebarInner = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Brand */}
      <div
        className="flex items-center gap-3 px-5 py-[18px]"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div
          className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
          style={{ background: C.green }}
        >
          <GraduationCap size={13} style={{ color: '#FFFFFF' }} />
        </div>
        <div>
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold leading-none"
            style={{ color: C.green, fontFamily: 'Albert Sans, sans-serif' }}
          >
            SmartCampus
          </p>
          <p
            className="text-[9px] uppercase tracking-widest mt-0.5"
            style={{ color: C.muted }}
          >
            Operations Hub
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <p
          className="text-[9px] uppercase tracking-[0.2em] px-3 mb-2"
          style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif', opacity: 0.6 }}
        >
          Navigation
        </p>
        <div className="space-y-0.5">
          {coreNav.map(item => (
            <NavLink key={item.href} item={item} active={active(item.href)} onClick={onNav} />
          ))}
        </div>

        {user?.role === 'SUPER_ADMIN' && (
          <div className="mt-5">
            <p
              className="text-[9px] uppercase tracking-[0.2em] px-3 mb-2"
              style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif', opacity: 0.6 }}
            >
              Administration
            </p>
            <div className="space-y-0.5">
              {adminNav.map(item => (
                <NavLink key={item.href} item={item} active={active(item.href)} onClick={onNav} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User footer */}
      <div
        className="px-3 pb-4 pt-3 space-y-0.5"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <Link
          to="/profile"
          onClick={onNav}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150"
          style={{
            background: active('/profile') ? C.greenDim : 'transparent',
          }}
          onMouseEnter={e => {
            if (!active('/profile')) e.currentTarget.style.background = C.hover;
          }}
          onMouseLeave={e => {
            if (!active('/profile')) e.currentTarget.style.background = 'transparent';
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
            style={{ background: C.greenDim, color: C.green, fontFamily: 'Albert Sans, sans-serif' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[12px] font-medium truncate leading-tight"
              style={{ color: C.fg, fontFamily: 'Albert Sans, sans-serif' }}
            >
              {user?.fullName ?? 'User'}
            </p>
            {roleMeta && (
              <p
                className="text-[10px] font-semibold uppercase tracking-wider truncate"
                style={{ color: roleMeta.color, fontFamily: 'Albert Sans, sans-serif' }}
              >
                {roleMeta.label}
              </p>
            )}
          </div>
          <UserCircle size={13} style={{ color: C.muted, flexShrink: 0 }} />
        </Link>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-md w-full transition-all duration-150"
          style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(217,68,68,0.06)';
            e.currentTarget.style.color      = '#D94444';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color      = C.muted;
          }}
        >
          <LogOut size={14} style={{ flexShrink: 0 }} />
          <span className="text-[13px]">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0"
        style={{
          width:        'var(--sidebar-width)',
          background:   C.card,
          borderRight:  `1px solid ${C.border}`,
        }}
      >
        <SidebarInner />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(26,46,26,0.3)' }}
            onClick={() => setOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 bottom-0 flex flex-col"
            style={{
              width:       'var(--sidebar-width)',
              background:  C.card,
              borderRight: `1px solid ${C.border}`,
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: C.green }}
              >
                Menu
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{ color: C.muted }}
                onMouseEnter={e => (e.currentTarget.style.color = C.fg)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >
                <X size={16} />
              </button>
            </div>
            <SidebarInner onNav={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div
          className="lg:hidden flex items-center justify-between px-4 py-3"
          style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}
        >
          <button
            onClick={() => setOpen(true)}
            style={{ color: C.muted }}
            onMouseEnter={e => (e.currentTarget.style.color = C.fg)}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
          >
            <Menu size={20} />
          </button>
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: C.green, fontFamily: 'Albert Sans, sans-serif' }}
          >
            SmartCampus
          </span>
          <div className="w-5" />
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
