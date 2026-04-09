import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PasskeyManager from '@/components/settings/PasskeyManager';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import {
  Mail, Fingerprint, Phone, ArrowLeft, Clock, Pencil, X, Check,
  AtSign, Users, Building2, Loader2, Lock, Globe, GraduationCap,
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

const GENDER_OPTIONS = [
  { value: 'MALE',              label: 'Male' },
  { value: 'FEMALE',            label: 'Female' },
  { value: 'OTHER',             label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const S: React.CSSProperties = { fontFamily: 'Albert Sans, sans-serif' };

function formatGender(val?: string | null) {
  if (!val) return null;
  return GENDER_OPTIONS.find(o => o.value === val)?.label ?? val.replace(/_/g, ' ');
}

function splitPhone(raw: string): { code: string; number: string } {
  if (!raw) return { code: '+94', number: '' };
  const m = raw.match(/^(\+\d{1,4})\s*(.*)$/);
  return m ? { code: m[1], number: m[2] } : { code: '+94', number: raw };
}

function joinPhone(code: string, num: string): string {
  const cleaned = num.replace(/[^\d\s-]/g, '').trim();
  return cleaned ? `${code} ${cleaned}` : '';
}

/* ─── Compact row ─── */

function Row({
  icon: Icon, label, value, locked, editing, children,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  value: string | undefined | null;
  locked?: boolean;
  editing?: boolean;
  children?: React.ReactNode;
}) {
  const editable = editing && !locked && children;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#EFF3EC] last:border-0">
      <div
        className="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-px"
        style={{ background: editable ? 'rgba(45,122,58,0.07)' : '#F2F5F0' }}
      >
        <Icon size={12} style={{ color: editable ? '#2D7A3A' : '#8B9B8B' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ ...S, color: '#8B9B8B' }}>
            {label}
          </span>
          {locked && <Lock size={8} style={{ color: '#CBD5C7' }} />}
        </div>
        {editable ? (
          <div className="mt-1">{children}</div>
        ) : (
          <p className="text-[13px] leading-snug truncate" style={{ ...S, color: value ? '#1A2E1A' : '#C5CFC2' }}>
            {value || '\u2014'}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Page ─── */

const ProfilePage: React.FC = () => {
  const { user, checkAuth } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [form, setForm] = useState({
    fullName: '', phoneCode: '+94', phoneNumber: '',
    contactEmail: '', gender: '', department: '',
  });

  const nameRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    const { code, number } = splitPhone(user?.phone ?? '');
    setForm({
      fullName: user?.fullName ?? '', phoneCode: code, phoneNumber: number,
      contactEmail: user?.contactEmail ?? '', gender: user?.gender ?? '',
      department: user?.department ?? '',
    });
    setToast(null);
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing) nameRef.current?.focus();
  }, [isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    setToast(null);
    try {
      await api.put('/auth/profile', {
        fullName: form.fullName,
        phone: joinPhone(form.phoneCode, form.phoneNumber) || null,
        contactEmail: form.contactEmail || null,
        gender: form.gender || null,
        department: form.department || null,
      });
      await checkAuth();
      setIsEditing(false);
      setToast({ msg: 'Profile updated.', ok: true });
      setTimeout(() => setToast(null), 2500);
    } catch (err: unknown) {
      const a = err as { response?: { data?: { message?: string; errors?: Record<string, string> } } };
      const ve = a.response?.data?.errors;
      setToast({
        msg: ve ? Object.values(ve).join(', ') : (a.response?.data?.message || 'Save failed.'),
        ok: false,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const role       = user?.role;
  const roleMeta   = role ? ROLE_META[role] : undefined;
  const statusMeta = user?.status ? STATUS_META[user.status] : undefined;
  const isStudent  = role === 'STUDENT';
  const hasDomain  = role === 'DOMAIN_ADMIN' || role === 'TECHNICIAN' || role === 'SUPER_ADMIN';

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const lastLogin = user?.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  const inp = 'h-8 bg-[#FAFCF9] border-[#DDE5DA] rounded text-[13px] focus-visible:border-[#2D7A3A] focus-visible:ring-[#2D7A3A]/15 placeholder:text-[#C5CFC2]';

  return (
    <div className="p-6 sm:p-8 max-w-[960px] mx-auto page-enter">

      {/* Back */}
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 mb-5 group" style={{ ...S, color: '#6B7B6B' }}>
        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] group-hover:text-[#1A2E1A] transition-colors">
          Dashboard
        </span>
      </Link>

      {/* Header */}
      <header className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-1.5" style={{ ...S, color: '#2D7A3A' }}>Account</p>
        <h1 className="font-serif leading-tight" style={{ color: '#1A2E1A', fontSize: 'clamp(24px, 3vw, 32px)' }}>
          Profile &amp; Security
        </h1>
        <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg, #E2E8DF 0%, transparent 70%)' }} />
      </header>

      {/* Toast */}
      {toast && (
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-md text-[12px] font-medium mb-5"
          style={{
            ...S,
            background: toast.ok ? 'rgba(45,122,58,0.06)' : 'rgba(217,68,68,0.06)',
            border: `1px solid ${toast.ok ? 'rgba(45,122,58,0.18)' : 'rgba(217,68,68,0.18)'}`,
            color: toast.ok ? '#2D7A3A' : '#D94444',
          }}
        >
          {toast.ok ? <Check size={13} /> : <X size={13} />}
          {toast.msg}
        </div>
      )}

      {/* ═══ Two-column layout ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

        {/* ── LEFT: Profile card (3 cols) ── */}
        <div
          className="lg:col-span-3 rounded-lg overflow-hidden"
          style={{
            background: '#fff',
            border: isEditing ? '1px solid rgba(45,122,58,0.3)' : '1px solid #E2E8DF',
            boxShadow: isEditing ? '0 0 0 3px rgba(45,122,58,0.05)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          {/* Identity header */}
          <div className="p-5 flex items-center gap-4" style={{ borderBottom: '1px solid #EFF3EC' }}>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-semibold shrink-0"
              style={{ background: 'rgba(45,122,58,0.08)', color: '#2D7A3A', border: '2px solid rgba(45,122,58,0.15)', ...S }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-[18px] truncate leading-tight" style={{ color: '#1A2E1A' }}>
                {user?.fullName ?? '\u2014'}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[12px] truncate" style={{ ...S, color: '#6B7B6B' }}>{user?.email}</span>
                {roleMeta && (
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: `${roleMeta.color}14`, color: roleMeta.color, ...S }}
                  >
                    {roleMeta.label}
                  </span>
                )}
                {statusMeta && (
                  <span className="flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusMeta.color }} />
                    <span className="text-[9px] font-medium" style={{ color: statusMeta.color, ...S }}>{statusMeta.label}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit controls bar */}
          <div
            className="flex items-center justify-between px-5 py-2.5"
            style={{ borderBottom: '1px solid #EFF3EC', background: isEditing ? 'rgba(45,122,58,0.02)' : '#FBFCFB' }}
          >
            {!isEditing ? (
              <>
                {lastLogin && (
                  <span className="flex items-center gap-1.5 text-[10px]" style={{ ...S, color: '#A3B09F' }}>
                    <Clock size={10} /> Last login {lastLogin}
                  </span>
                )}
                <button
                  onClick={startEditing}
                  className="flex items-center gap-1.5 px-3 py-[5px] rounded text-[10px] font-semibold uppercase tracking-wider ml-auto transition-all hover:shadow-sm active:scale-[0.97]"
                  style={{ background: 'rgba(45,122,58,0.08)', color: '#2D7A3A', border: '1px solid rgba(45,122,58,0.15)', ...S }}
                >
                  <Pencil size={10} /> Edit
                </button>
              </>
            ) : (
              <>
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ ...S, color: '#8B9B8B' }}>
                  Editing
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setIsEditing(false); setToast(null); }}
                    disabled={isSaving}
                    className="px-3 py-[5px] rounded text-[10px] font-semibold uppercase tracking-wider transition-all hover:shadow-sm disabled:opacity-40"
                    style={{ background: '#F8FAF7', color: '#6B7B6B', border: '1px solid #E2E8DF', ...S }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !form.fullName.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-[5px] rounded text-[10px] font-semibold uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
                    style={{ background: '#2D7A3A', color: '#fff', ...S }}
                  >
                    {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Fields */}
          <div className="px-5 pb-1">

            {/* Editable */}
            <Row icon={Mail} label="Full Name" value={user?.fullName} editing={isEditing}>
              <Input ref={nameRef} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className={inp} style={S} />
            </Row>

            <Row icon={Phone} label="Phone" value={user?.phone} editing={isEditing}>
              <div className="flex gap-1.5">
                <Input
                  value={form.phoneCode}
                  onChange={e => { let v = e.target.value; if (v && !v.startsWith('+')) v = '+' + v; setForm({ ...form, phoneCode: v }); }}
                  className={`${inp} w-[64px] shrink-0 text-center px-1`} style={S} maxLength={5}
                />
                <Input
                  value={form.phoneNumber}
                  onChange={e => setForm({ ...form, phoneNumber: e.target.value.replace(/[^\d\s-]/g, '') })}
                  placeholder="77 123 4567" className={`${inp} flex-1`} style={S}
                />
              </div>
            </Row>

            <Row icon={AtSign} label="Contact Email" value={user?.contactEmail} editing={isEditing}>
              <Input type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="personal@email.com" className={inp} style={S} />
            </Row>

            <Row icon={Users} label="Gender" value={formatGender(user?.gender)} editing={isEditing}>
              <Select value={form.gender} onValueChange={val => setForm({ ...form, gender: val })}>
                <SelectTrigger className="h-8 w-full bg-[#FAFCF9] border-[#DDE5DA] rounded text-[13px] focus:border-[#2D7A3A] focus:ring-[#2D7A3A]/15" style={S}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Row>

            <Row icon={Building2} label="Department" value={user?.department} editing={isEditing}>
              <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. Computing" className={inp} style={S} />
            </Row>

            {/* Role-aware read-only fields */}
            {isStudent && user?.studentId && (
              <Row icon={GraduationCap} label="Student ID" value={user.studentId} locked editing={isEditing} />
            )}
            {hasDomain && (
              <Row icon={Globe} label="Domain" value={user?.domainName} locked editing={isEditing} />
            )}
          </div>

          {isEditing && (
            <div className="px-5 py-2.5 flex items-center gap-1.5" style={{ borderTop: '1px solid #EFF3EC', background: '#FBFCFB' }}>
              <Lock size={9} style={{ color: '#CBD5C7' }} />
              <p className="text-[10px]" style={{ ...S, color: '#A3B09F' }}>
                Email, role{hasDomain ? ', domain' : ''}{isStudent ? ', student ID' : ''} &amp; status are managed by admins.
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Passkeys (2 cols) ── */}
        <div
          className="lg:col-span-2 rounded-lg overflow-hidden"
          style={{ background: '#fff', border: '1px solid #E2E8DF' }}
        >
          <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ borderBottom: '1px solid #E2E8DF' }}>
            <Fingerprint size={13} style={{ color: '#2D7A3A' }} />
            <p className="font-serif text-[15px]" style={{ color: '#1A2E1A' }}>Passkeys</p>
          </div>
          <div className="p-5">
            <PasskeyManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
