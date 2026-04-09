import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PasskeyManager from '@/components/settings/PasskeyManager';
import {
  Mail, ShieldCheck, Globe, Activity, Fingerprint, UserCircle,
  GraduationCap, Phone, ArrowLeft, Clock,
} from 'lucide-react';

const ROLE_META: Record<string, { label: string; color: string }> = {
  STUDENT:      { label: 'Student',      color: '#2D7A3A' },
  DOMAIN_ADMIN: { label: 'Domain Admin', color: '#7B6BA5' },
  TECHNICIAN:   { label: 'Technician',   color: '#8B7BB5' },
  SUPER_ADMIN:  { label: 'Super Admin',  color: '#2D7A3A' },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  ACTIVE:             { label: 'Active',             color: '#2D7A3A' },
  PENDING_ACTIVATION: { label: 'Pending Activation', color: '#D4A017' },
  PENDING_PROFILE:    { label: 'Pending Profile',    color: '#D4A017' },
  SUSPENDED:          { label: 'Suspended',          color: '#D94444' },
};

function InfoField({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  value: string | undefined | null;
}) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: '#F2F5F0' }}
      >
        <Icon size={13} style={{ color: '#6B7B6B' }} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1"
          style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
        >
          {label}
        </p>
        <p
          className="text-[14px] truncate"
          style={{
            color: value ? '#1A2E1A' : '#B8C4B3',
            fontFamily: 'Albert Sans, sans-serif',
          }}
        >
          {value ?? '\u2014'}
        </p>
      </div>
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const roleMeta   = user?.role   ? ROLE_META[user.role]     : undefined;
  const statusMeta = user?.status ? STATUS_META[user.status] : undefined;

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const lastLogin = user?.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className="p-6 sm:p-8 max-w-[820px] mx-auto page-enter">

      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 mb-6 group"
        style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
      >
        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] group-hover:text-[#1A2E1A] transition-colors">
          Dashboard
        </span>
      </Link>

      {/* Page header */}
      <header className="mb-8">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-2"
          style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
        >
          Account
        </p>
        <h1
          className="font-serif leading-tight"
          style={{ color: '#1A2E1A', fontSize: 'clamp(26px, 3vw, 34px)' }}
        >
          Profile &amp; Security
        </h1>
        <div
          className="mt-5 h-px"
          style={{ background: 'linear-gradient(90deg, #E2E8DF 0%, transparent 70%)' }}
        />
      </header>

      {/* Identity card */}
      <section
        className="rounded-lg overflow-hidden mb-5"
        style={{ background: '#FFFFFF', border: '1px solid #E2E8DF' }}
      >
        <div className="p-6 flex items-center gap-5">
          <div
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-[20px] font-semibold shrink-0"
            style={{
              background: 'rgba(45,122,58,0.08)',
              color: '#2D7A3A',
              border: '2px solid rgba(45,122,58,0.15)',
              fontFamily: 'Albert Sans, sans-serif',
            }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-serif text-[22px] truncate leading-tight" style={{ color: '#1A2E1A' }}>
              {user?.fullName ?? '\u2014'}
            </p>
            <p
              className="text-[13px] truncate mt-1"
              style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
            >
              {user?.email ?? '\u2014'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {roleMeta && (
              <span
                className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{
                  background: `${roleMeta.color}14`,
                  color: roleMeta.color,
                  fontFamily: 'Albert Sans, sans-serif',
                }}
              >
                {roleMeta.label}
              </span>
            )}
            {statusMeta && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusMeta.color }} />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: statusMeta.color, fontFamily: 'Albert Sans, sans-serif' }}
                >
                  {statusMeta.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {lastLogin && (
          <div
            className="flex items-center gap-2 px-6 py-2.5"
            style={{ borderTop: '1px solid #EFF3EC', background: '#F8FAF7' }}
          >
            <Clock size={10} style={{ color: '#6B7B6B', opacity: 0.6 }} />
            <p
              className="text-[10px] tracking-wide"
              style={{ color: '#6B7B6B', opacity: 0.6, fontFamily: 'Albert Sans, sans-serif' }}
            >
              Last login {lastLogin}
            </p>
          </div>
        )}
      </section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Account details */}
        <section
          className="lg:col-span-2 rounded-lg"
          style={{ background: '#FFFFFF', border: '1px solid #E2E8DF' }}
        >
          <div
            className="flex items-center gap-2.5 px-6 py-4"
            style={{ borderBottom: '1px solid #E2E8DF' }}
          >
            <UserCircle size={13} style={{ color: '#2D7A3A' }} />
            <p className="font-serif text-[15px]" style={{ color: '#1A2E1A' }}>
              Details
            </p>
          </div>

          <div className="px-6 divide-y" style={{ borderColor: '#EFF3EC' }}>
            <InfoField icon={Mail}        label="Email"      value={user?.email} />
            <InfoField icon={ShieldCheck}  label="Role"       value={user?.role?.replace(/_/g, ' ')} />
            <InfoField icon={Activity}     label="Status"     value={user?.status?.replace(/_/g, ' ')} />
            <InfoField icon={Globe}        label="Domain"     value={user?.domainId ?? undefined} />
            {user?.studentId && (
              <InfoField icon={GraduationCap} label="Student ID" value={user.studentId} />
            )}
            {user?.phone && (
              <InfoField icon={Phone} label="Phone" value={user.phone} />
            )}
          </div>
        </section>

        {/* Passkeys */}
        <section
          className="lg:col-span-3 rounded-lg"
          style={{ background: '#FFFFFF', border: '1px solid #E2E8DF' }}
        >
          <div
            className="flex items-center gap-2.5 px-6 py-4"
            style={{ borderBottom: '1px solid #E2E8DF' }}
          >
            <Fingerprint size={13} style={{ color: '#2D7A3A' }} />
            <p className="font-serif text-[15px]" style={{ color: '#1A2E1A' }}>
              Passkeys &amp; Biometrics
            </p>
          </div>

          <div className="p-6">
            <PasskeyManager />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
