import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookMarked, CalendarCheck, Ticket, Users, Globe2,
  ShieldAlert, Clock, CheckCircle2, AlertTriangle, Activity,
  ArrowRight, ArrowLeft,
} from 'lucide-react';

/* ─── Types ─── */
interface DashboardStats {
  totalUsers: number;
  activeDomains: number;
  pendingActivations: number;
  systemAlerts: number;
}
interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  changedByName: string;
  newRole: string;
  newDomainName: string | null;
  changedAt: string;
}

const STORAGE_KEYS = {
  STATS:     'scoh_dashboard_stats',
  ACTIVITY:  'scoh_dashboard_activity',
  PENDING:   'scoh_dashboard_pending',
  TIMESTAMP: 'scoh_dashboard_last_fetch',
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

/* ─── Stat card ─── */
function StatCard({
  label, value, sub, accent, icon: Icon,
}: {
  label: string; value: React.ReactNode; sub?: string;
  accent: string; icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <div
      className="relative p-5 rounded-lg overflow-hidden"
      style={{ background: '#FFFFFF', border: '1px solid #E2E8DF' }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accent }} />
      <div className="flex items-start justify-between mb-4">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
        >
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ background: `${accent}14` }}
        >
          <Icon size={14} style={{ color: accent }} />
        </div>
      </div>
      <p
        className="font-serif text-[36px] leading-none mb-1"
        style={{ color: '#1A2E1A' }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-[11px] mt-1.5"
          style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Quick-action card ─── */
function ActionCard({
  title, desc, href, icon: Icon, accent,
}: {
  title: string; desc: string; href: string;
  icon: React.ComponentType<{ size?: number }>; accent: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={href}
      className="group flex flex-col justify-between p-5 rounded-lg transition-all duration-200"
      style={{
        background:   '#FFFFFF',
        border:       `1px solid ${hovered ? `${accent}40` : '#E2E8DF'}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center mb-4"
          style={{ background: `${accent}14` }}
        >
          <Icon size={16} style={{ color: accent }} />
        </div>
        <p
          className="font-serif text-[17px] mb-1.5"
          style={{ color: '#1A2E1A' }}
        >
          {title}
        </p>
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
        >
          {desc}
        </p>
      </div>
      <div
        className="mt-5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: accent, fontFamily: 'Albert Sans, sans-serif' }}
      >
        Open
        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

/* ─── Campus Pulse ─── */

const ZONES = [
  { id: 'library',  name: 'Central Library', x: 18, y: 22, baseOccupancy: 72 },
  { id: 'labs',     name: 'Science Labs',    x: 72, y: 18, baseOccupancy: 58 },
  { id: 'mainHall', name: 'Main Hall',       x: 42, y: 55, baseOccupancy: 45 },
  { id: 'sports',   name: 'Sports Complex',  x: 80, y: 70, baseOccupancy: 33 },
  { id: 'canteen',  name: 'Student Canteen', x: 28, y: 78, baseOccupancy: 81 },
  { id: 'admin',    name: 'Admin Block',     x: 58, y: 35, baseOccupancy: 25 },
];

function CampusPulse() {
  const [hovered, setHovered] = useState<string | null>(null);

  const occupancy = useMemo(() => {
    const map: Record<string, number> = {};
    ZONES.forEach(z => {
      const jitter = Math.floor(Math.random() * 20) - 10;
      map[z.id] = Math.max(5, Math.min(98, z.baseOccupancy + jitter));
    });
    return map;
  }, []);

  const barColor = (pct: number) =>
    pct > 70 ? '#D4A017' : pct > 40 ? '#5B8C5A' : '#2D7A3A';

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: '#FFFFFF', border: '1px solid #E2E8DF' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid #E2E8DF' }}
      >
        <div className="flex items-center gap-2.5">
          <Activity size={14} style={{ color: '#2D7A3A' }} />
          <p className="font-serif text-[15px]" style={{ color: '#1A2E1A' }}>
            Campus Pulse
          </p>
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(45,122,58,0.08)', color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
        >
          Live
        </span>
      </div>

      <div className="relative" style={{ paddingBottom: '52%' }}>
        {/* Campus outline SVG */}
        <svg
          viewBox="0 0 100 60"
          className="absolute inset-0 w-full h-full"
          style={{ overflow: 'visible' }}
        >
          {/* Ground paths */}
          <path
            d="M5,50 Q15,48 25,50 T45,48 T65,50 T85,48 L95,50 L95,55 Q50,58 5,55 Z"
            fill="#E8F0E6" stroke="#D0DAC9" strokeWidth="0.3"
          />
          {/* Building outlines */}
          <rect x="12" y="18" width="12" height="10" rx="0.5" fill="#EFF3EC" stroke="#D0DAC9" strokeWidth="0.3" />
          <rect x="66" y="14" width="14" height="9" rx="0.5" fill="#EFF3EC" stroke="#D0DAC9" strokeWidth="0.3" />
          <rect x="36" y="48" width="16" height="11" rx="0.5" fill="#EFF3EC" stroke="#D0DAC9" strokeWidth="0.3" />
          <rect x="73" y="62" width="15" height="10" rx="0.5" fill="#EFF3EC" stroke="#D0DAC9" strokeWidth="0.3" />
          <rect x="20" y="70" width="18" height="12" rx="0.5" fill="#EFF3EC" stroke="#D0DAC9" strokeWidth="0.3" />
          <rect x="52" y="30" width="12" height="8" rx="0.5" fill="#EFF3EC" stroke="#D0DAC9" strokeWidth="0.3" />
          {/* Paths between buildings */}
          <path d="M24,28 Q34,38 42,48" fill="none" stroke="#D0DAC9" strokeWidth="0.4" strokeDasharray="1.5 1" />
          <path d="M58,38 Q62,45 52,48" fill="none" stroke="#D0DAC9" strokeWidth="0.4" strokeDasharray="1.5 1" />
          <path d="M73,23 Q68,30 58,32" fill="none" stroke="#D0DAC9" strokeWidth="0.4" strokeDasharray="1.5 1" />
          <path d="M44,59 Q55,64 73,67" fill="none" stroke="#D0DAC9" strokeWidth="0.4" strokeDasharray="1.5 1" />
          {/* Trees */}
          {[[8,45],[32,42],[50,25],[90,40],[60,55],[15,60]].map(([tx,ty], i) => (
            <circle key={i} cx={tx} cy={ty} r="2" fill="#D0DAC9" opacity="0.4" />
          ))}
        </svg>

        {/* Zone dots */}
        {ZONES.map(zone => {
          const pct = occupancy[zone.id];
          const isHov = hovered === zone.id;
          return (
            <div
              key={zone.id}
              className="absolute"
              style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%, -50%)', zIndex: isHov ? 20 : 10 }}
              onMouseEnter={() => setHovered(zone.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Pulse ring */}
              <div
                className="absolute inset-0 rounded-full status-dot"
                style={{
                  width: 22, height: 22, left: -5, top: -5,
                  background: 'rgba(45,122,58,0.10)',
                }}
              />
              {/* Dot */}
              <div
                className="w-3 h-3 rounded-full cursor-pointer transition-transform duration-200"
                style={{
                  background: '#2D7A3A',
                  boxShadow: isHov ? '0 0 0 4px rgba(45,122,58,0.15)' : 'none',
                  transform: isHov ? 'scale(1.4)' : 'scale(1)',
                }}
              />
              {/* Tooltip */}
              {isHov && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-md whitespace-nowrap pointer-events-none"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8DF',
                    boxShadow: '0 4px 12px rgba(26,46,26,0.08)',
                    fontFamily: 'Albert Sans, sans-serif',
                  }}
                >
                  <p className="text-[11px] font-semibold mb-1.5" style={{ color: '#1A2E1A' }}>
                    {zone.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: 60, background: '#EFF3EC' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: barColor(pct) }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: barColor(pct) }}>
                      {pct}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap items-center gap-4 px-5 py-3"
        style={{ borderTop: '1px solid #E2E8DF' }}
      >
        {ZONES.map(z => (
          <div
            key={z.id}
            className="flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setHovered(z.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#2D7A3A' }} />
            <span
              className="text-[10px]"
              style={{
                color: hovered === z.id ? '#1A2E1A' : '#6B7B6B',
                fontFamily: 'Albert Sans, sans-serif',
                fontWeight: hovered === z.id ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {z.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Student view ─── */
const StudentDashboard = () => (
  <div className="space-y-8 page-enter">
    <section>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-4"
        style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
      >
        Quick Access
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard title="Resource Catalog" desc="Browse labs, study rooms and equipment." href="/resources" icon={BookMarked}   accent="#2D7A3A" />
        <ActionCard title="My Bookings"      desc="View and manage facility reservations."  href="/bookings"  icon={CalendarCheck} accent="#5B8C5A" />
        <ActionCard title="Support Tickets"  desc="Report technical or facility issues."    href="/tickets"   icon={Ticket}        accent="#D94444" />
      </div>
    </section>

    <section>
      <CampusPulse />
    </section>
  </div>
);

/* ─── Super Admin view ─── */
const SuperAdminDashboard = ({
  stats, activity, pending, onActionComplete,
}: {
  stats: DashboardStats | null;
  activity: AuditLog[];
  pending: User[];
  onActionComplete: () => void;
}) => {
  const handleAssign = async (userId: string, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, {
        newRole: role,
        reason: 'Initial assignment from dashboard queue',
      });
      onActionComplete();
    } catch {
      alert('Assignment failed. Domain Admin requires full personnel console for domain selection.');
    }
  };

  return (
    <div className="space-y-8 page-enter">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users"       value={stats?.totalUsers          ?? '—'} sub="Campus personnel"     accent="#2D7A3A" icon={Users}         />
        <StatCard label="Active Domains"    value={stats?.activeDomains       ?? '—'} sub="Operating units"      accent="#5B8C5A" icon={Globe2}         />
        <StatCard label="Pending Clearance" value={stats?.pendingActivations  ?? '—'} sub="Awaiting assignment"  accent="#7B6BA5" icon={Clock}          />
        <StatCard label="Suspended Access"  value={stats?.systemAlerts        ?? '0'} sub="System alerts"        accent="#D94444" icon={AlertTriangle}  />
      </div>

      {/* Audit + Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Audit feed */}
        <div
          className="rounded-lg overflow-hidden flex flex-col"
          style={{ background: '#FFFFFF', border: '1px solid #E2E8DF', maxHeight: 370 }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid #E2E8DF' }}
          >
            <div className="flex items-center gap-2.5">
              <Activity size={14} style={{ color: '#2D7A3A' }} />
              <p className="font-serif text-[15px]" style={{ color: '#1A2E1A' }}>
                System Audit Feed
              </p>
            </div>
            <Link
              to="/admin/audit"
              className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
            >
              Full Log <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: '#E2E8DF' }}>
            {activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 size={26} style={{ color: '#E2E8DF', marginBottom: 8 }} />
                <p
                  className="text-[13px]"
                  style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                >
                  No recent activity
                </p>
              </div>
            ) : activity.map(log => (
              <div
                key={log.id}
                className="flex gap-4 items-start px-5 py-3.5 transition-colors"
                style={{ borderColor: '#E2E8DF' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F2F5F0')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className="font-mono text-[10px] shrink-0 min-w-[68px] leading-snug"
                  style={{ color: '#6B7B6B' }}
                >
                  {format(new Date(log.changedAt), 'MMM dd')}<br />
                  <span style={{ opacity: 0.5 }}>{format(new Date(log.changedAt), 'HH:mm')}</span>
                </div>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                >
                  <span style={{ color: '#1A2E1A', fontWeight: 500 }}>{log.userEmail}</span>
                  {' \u2192 '}
                  <span style={{ color: '#2D7A3A', fontWeight: 500 }}>
                    {log.newRole.replace('_', ' ')}{log.newDomainName ? ` (${log.newDomainName})` : ''}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending clearance */}
        <div
          className="rounded-lg overflow-hidden flex flex-col"
          style={{ background: '#FFFFFF', border: '1px solid #E2E8DF', maxHeight: 370 }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid #E2E8DF' }}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={14} style={{ color: '#7B6BA5' }} />
              <p className="font-serif text-[15px]" style={{ color: '#1A2E1A' }}>
                Pending Clearance
              </p>
            </div>
            <span
              className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{
                background: pending.length > 0 ? 'rgba(123,107,165,0.10)' : '#F2F5F0',
                color:      pending.length > 0 ? '#7B6BA5' : '#6B7B6B',
                fontFamily: 'Albert Sans, sans-serif',
              }}
            >
              {pending.length} waiting
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: '#E2E8DF' }}>
            {pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 size={26} style={{ color: '#5B8C5A', marginBottom: 8, opacity: 0.4 }} />
                <p className="font-serif text-[15px] mb-1" style={{ color: '#1A2E1A' }}>
                  Queue Clear
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                >
                  All staff accounts are active.
                </p>
              </div>
            ) : pending.map(p => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 transition-colors"
                onMouseEnter={e => (e.currentTarget.style.background = '#F2F5F0')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                    style={{
                      background: 'rgba(45,122,58,0.08)',
                      color: '#2D7A3A',
                      fontFamily: 'Albert Sans, sans-serif',
                    }}
                  >
                    {p.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-[13px] font-medium truncate"
                      style={{ color: '#1A2E1A', fontFamily: 'Albert Sans, sans-serif' }}
                    >
                      {p.fullName}
                    </p>
                    <p
                      className="text-[11px] truncate"
                      style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                    >
                      {p.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select
                    onValueChange={val => {
                      if (val === 'DOMAIN_ADMIN') window.location.href = '/admin/users';
                      else handleAssign(p.id, val);
                    }}
                  >
                    <SelectTrigger
                      className="h-7 w-28 text-[10px] font-semibold uppercase tracking-wider rounded-md"
                      style={{
                        background: '#F2F5F0',
                        border: '1px solid #E2E8DF',
                        color: '#6B7B6B',
                        fontFamily: 'Albert Sans, sans-serif',
                      }}
                    >
                      <SelectValue placeholder="Assign\u2026" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TECHNICIAN">Technician</SelectItem>
                      <SelectItem value="DOMAIN_ADMIN">Domain Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Link
                    to="/admin/users"
                    className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-md transition-colors"
                    style={{
                      background: '#F2F5F0',
                      color: '#6B7B6B',
                      border: '1px solid #E2E8DF',
                      fontFamily: 'Albert Sans, sans-serif',
                    }}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div
            className="px-5 py-2.5 text-center"
            style={{ borderTop: '1px solid #E2E8DF', background: '#F8FAF7' }}
          >
            <p
              className="text-[9px] uppercase tracking-widest"
              style={{ color: '#6B7B6B', opacity: 0.5 }}
            >
              Staff must be vetted before system access is granted
            </p>
          </div>
        </div>
      </div>

      {/* Admin quick links */}
      <section>
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-4"
          style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
        >
          Administration
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard title="Personnel"  desc="Manage roles, domains, and account status."  href="/admin/users"   icon={Users}       accent="#2D7A3A" />
          <ActionCard title="Domains"    desc="Configure campus department domains."         href="/admin/domains" icon={Globe2}       accent="#5B8C5A" />
          <ActionCard title="Audit Log"  desc="Review the security and change audit trail."  href="/admin/audit"   icon={ShieldAlert}  accent="#7B6BA5" />
        </div>
      </section>
    </div>
  );
};

const DomainAdminDashboard = () => (
  <div className="space-y-8 page-enter">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ActionCard title="Resources"  desc="Manage domain resources and availability."     href="/resources" icon={BookMarked}   accent="#2D7A3A" />
      <ActionCard title="Bookings"   desc="Review and approve facility booking requests." href="/bookings"  icon={CalendarCheck} accent="#5B8C5A" />
      <ActionCard title="Tickets"    desc="Monitor and resolve support tickets."           href="/tickets"   icon={Ticket}        accent="#7B6BA5" />
    </div>
  </div>
);

const TechnicianDashboard = () => (
  <div className="space-y-8 page-enter">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ActionCard title="Support Tickets" desc="View and action assigned maintenance tickets." href="/tickets"   icon={Ticket}    accent="#2D7A3A" />
      <ActionCard title="Resources"       desc="Check resource status and availability."       href="/resources" icon={BookMarked} accent="#5B8C5A" />
    </div>
  </div>
);

/* ─── Page root ─── */
const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.STATS);
    return s ? JSON.parse(s) : null;
  });
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    return s ? JSON.parse(s) : [];
  });
  const [pendingUsers, setPendingUsers] = useState<User[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.PENDING);
    return s ? JSON.parse(s) : [];
  });
  const [isLoading, setIsLoading] = useState(!stats);

  const fetchAdminData = async () => {
    try {
      const [sR, lR, pR] = await Promise.all([
        api.get('/admin/users/dashboard/stats'),
        api.get('/admin/users/audit-logs'),
        api.get('/admin/users/pending-activations'),
      ]);
      const ns = sR.data, na = lR.data.slice(0, 5), np = pR.data;
      setStats(ns); setRecentActivity(na); setPendingUsers(np);
      localStorage.setItem(STORAGE_KEYS.STATS,     JSON.stringify(ns));
      localStorage.setItem(STORAGE_KEYS.ACTIVITY,  JSON.stringify(na));
      localStorage.setItem(STORAGE_KEYS.PENDING,   JSON.stringify(np));
      localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (e) {
      console.error('Dashboard fetch failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') fetchAdminData();
  }, [user]);

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-2"
              style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
            >
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
            <h1
              className="font-serif leading-tight"
              style={{ color: '#1A2E1A', fontSize: 'clamp(26px, 3vw, 34px)' }}
            >
              {greeting()}, {user?.fullName?.split(' ')[0]}.
            </h1>
          </div>
          {isLoading && stats && (
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-3 h-3 rounded-full border-2 animate-spin"
                style={{ borderColor: '#2D7A3A', borderTopColor: 'transparent' }}
              />
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
              >
                Updating&hellip;
              </span>
            </div>
          )}
        </div>
        <div
          className="mt-5 h-px"
          style={{ background: 'linear-gradient(90deg, #E2E8DF 0%, transparent 70%)' }}
        />
      </header>

      {user?.role === 'STUDENT'      && <StudentDashboard />}
      {user?.role === 'DOMAIN_ADMIN' && <DomainAdminDashboard />}
      {user?.role === 'TECHNICIAN'   && <TechnicianDashboard />}
      {user?.role === 'SUPER_ADMIN'  && (
        isLoading && !stats ? (
          <div className="flex items-center justify-center py-24">
            <div
              className="w-8 h-8 rounded-full border-[3px] animate-spin"
              style={{ borderColor: '#2D7A3A', borderTopColor: 'transparent' }}
            />
          </div>
        ) : (
          <SuperAdminDashboard
            stats={stats}
            activity={recentActivity}
            pending={pendingUsers}
            onActionComplete={fetchAdminData}
          />
        )
      )}
    </div>
  );
};

export default DashboardPage;
