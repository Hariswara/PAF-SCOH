
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { resourceApi } from '@/lib/resourceApi';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BookMarked,
  FlaskConical,
  Library,
  Monitor,
  Plus,
  Search,
  X,
  ChevronDown,
  AlertCircle,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Users,
  MapPin,
  Loader2,
} from 'lucide-react';
import type {
  CreateResourceRequest,
  ResourceResponse,
  ResourceSearchParams,
  ResourceStatus,
  ResourceType,
  UpdateResourceRequest,
} from '@/types/resource';

// ── Design tokens (match AppLayout) ─────────────────────────────────────────
const C = {
  fg: '#1A2E1A',
  muted: '#6B7B6B',
  green: '#2D7A3A',
  greenDim: 'rgba(45,122,58,0.08)',
  border: '#E2E8DF',
  card: '#FFFFFF',
  red: '#D94444',
  redDim: 'rgba(217,68,68,0.06)',
};

// ── Constants ────────────────────────────────────────────────────────────────
const RESOURCE_TYPES: { value: ResourceType; label: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }[] = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall', icon: Library },
  { value: 'LAB', label: 'Laboratory', icon: FlaskConical },
  { value: 'MEETING_ROOM', label: 'Meeting Room', icon: Users },
  { value: 'EQUIPMENT', label: 'Equipment', icon: Monitor },
  { value: 'OTHER', label: 'Other', icon: BookMarked },
];

const TYPE_MAP = Object.fromEntries(RESOURCE_TYPES.map((t) => [t.value, t]));

const labelCls = 'text-[10px] uppercase tracking-[0.18em] font-semibold';
const labelStyle: React.CSSProperties = { color: C.muted, fontFamily: 'Albert Sans, sans-serif' };
const inputCls =
  'h-10 text-[13px] bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-[#2D7A3A] px-0';

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ResourceStatus }) {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
      style={{
        background: isActive ? C.greenDim : C.redDim,
        color: isActive ? C.green : C.red,
        border: `1px solid ${isActive ? 'rgba(45,122,58,0.2)' : 'rgba(217,68,68,0.2)'}`,
        fontFamily: 'Albert Sans, sans-serif',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: isActive ? C.green : C.red }}
      />
      {isActive ? 'Active' : 'Out of Service'}
    </span>
  );
}

// ── Resource card ─────────────────────────────────────────────────────────────
interface ResourceCardProps {
  resource: ResourceResponse;
  canManage: boolean;
  onEdit: (r: ResourceResponse) => void;
  onDelete: (r: ResourceResponse) => void;
  onToggleStatus: (r: ResourceResponse) => void;
}

function ResourceCard({ resource, canManage, onEdit, onDelete, onToggleStatus }: ResourceCardProps) {
  const meta = TYPE_MAP[resource.resourceType];
  const Icon = meta?.icon ?? BookMarked;

  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-3 transition-shadow hover:shadow-md"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{ background: C.greenDim }}
          >
            <Icon size={16} style={{ color: C.green }} />
          </div>
          <div className="min-w-0">
            <p
              className="text-[14px] font-semibold leading-tight truncate"
              style={{ color: C.fg, fontFamily: 'Albert Sans, sans-serif' }}
            >
              {resource.name}
            </p>
            <p
              className="text-[11px] uppercase tracking-wider mt-0.5"
              style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
            >
              {meta?.label ?? resource.resourceType}
            </p>
          </div>
        </div>
        <StatusBadge status={resource.status} />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span
          className="flex items-center gap-1 text-[12px]"
          style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
        >
          <MapPin size={11} />
          {resource.location}
        </span>
        {resource.capacity !== null && (
          <span
            className="flex items-center gap-1 text-[12px]"
            style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
          >
            <Users size={11} />
            {resource.capacity} seats
          </span>
        )}
        {resource.domainName && (
          <span
            className="flex items-center gap-1 text-[12px]"
            style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
          >
            <BookMarked size={11} />
            {resource.domainName}
          </span>
        )}
      </div>

      {resource.description && (
        <p
          className="text-[12px] leading-relaxed line-clamp-2"
          style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
        >
          {resource.description}
        </p>
      )}

      {/* Admin actions */}
      {canManage && (
        <div
          className="flex items-center gap-2 pt-2"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <button
            onClick={() => onEdit(resource)}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded transition-colors"
            style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.greenDim; e.currentTarget.style.color = C.green; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
          >
            <Pencil size={11} /> Edit
          </button>

          <button
            onClick={() => onToggleStatus(resource)}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded transition-colors"
            style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.greenDim; e.currentTarget.style.color = C.green; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
          >
            {resource.status === 'ACTIVE'
              ? <><ToggleRight size={12} /> Deactivate</>
              : <><ToggleLeft size={12} /> Activate</>}
          </button>

          <button
            onClick={() => onDelete(resource)}
            className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded transition-colors"
            style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.redDim; e.currentTarget.style.color = C.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Create / Edit modal ───────────────────────────────────────────────────────
interface ResourceFormModalProps {
  editing: ResourceResponse | null;   // null = create mode
  domains: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
  defaultDomainId?: string;           // pre-fill for domain admins
}

function ResourceFormModal({
  editing,
  domains,
  onClose,
  onSaved,
  defaultDomainId,
}: ResourceFormModalProps) {
  const isEdit = editing !== null;

  const [form, setForm] = useState({
    domainId: editing?.domainId ?? defaultDomainId ?? '',
    resourceType: editing?.resourceType ?? '' as ResourceType | '',
    name: editing?.name ?? '',
    description: editing?.description ?? '',
    location: editing?.location ?? '',
    capacity: editing?.capacity !== null && editing?.capacity !== undefined
      ? String(editing.capacity)
      : '',
    metadata: editing?.metadata ?? '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.resourceType) { setError('Please select a resource type.'); return; }
    if (!form.domainId) { setError('Please select a domain.'); return; }

    setSubmitting(true);
    setError(null);

    const payload = {
      resourceType: form.resourceType as ResourceType,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      location: form.location.trim(),
      capacity: form.capacity !== '' ? parseInt(form.capacity, 10) : undefined,
      metadata: form.metadata.trim() || undefined,
    };

    try {
      if (isEdit) {
        await resourceApi.update(editing!.id, payload as UpdateResourceRequest);
        toast.success('Resource updated successfully.');
      } else {
        await resourceApi.create({ ...payload, domainId: form.domainId } as CreateResourceRequest);
        toast.success('Resource created successfully.');
      }
      onSaved();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Close on backdrop click
  const backdropRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,46,26,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div>
            <p
              className="text-[9px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: C.green, fontFamily: 'Albert Sans, sans-serif' }}
            >
              {isEdit ? 'Edit Resource' : 'New Resource'}
            </p>
            <h2
              className="font-serif text-[20px] leading-tight mt-0.5"
              style={{ color: C.fg }}
            >
              {isEdit ? editing!.name : 'Create Resource'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: C.muted }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.border; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Domain (hidden for domain admins who have a fixed domain) */}
          {!defaultDomainId && (
            <div className="space-y-2">
              <Label className={labelCls} style={labelStyle}>Domain *</Label>
              <Select
                value={form.domainId}
                onValueChange={(v) => setForm((f) => ({ ...f, domainId: v }))}
                required
              >
                <SelectTrigger className="h-10 text-[13px]">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Resource type */}
          <div className="space-y-2">
            <Label className={labelCls} style={labelStyle}>Resource Type *</Label>
            <Select
              value={form.resourceType}
              onValueChange={(v) => setForm((f) => ({ ...f, resourceType: v as ResourceType }))}
              required
            >
              <SelectTrigger className="h-10 text-[13px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className={labelCls} style={labelStyle}>Name *</Label>
            <Input
              placeholder="e.g. Lab 301 — Networking"
              value={form.name}
              onChange={set('name')}
              required
              minLength={2}
              maxLength={255}
              className={inputCls}
              style={{ borderBottomColor: C.border }}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className={labelCls} style={labelStyle}>Location *</Label>
            <Input
              placeholder="e.g. Building A, 3rd Floor"
              value={form.location}
              onChange={set('location')}
              required
              maxLength={255}
              className={inputCls}
              style={{ borderBottomColor: C.border }}
            />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label className={labelCls} style={labelStyle}>
              Capacity{' '}
              <span className="normal-case font-normal opacity-50">(seats — leave blank for equipment)</span>
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="e.g. 40"
              value={form.capacity}
              onChange={set('capacity')}
              className={inputCls}
              style={{ borderBottomColor: C.border }}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className={labelCls} style={labelStyle}>Description</Label>
            <Textarea
              placeholder="Optional notes about facilities, equipment available, access rules…"
              value={form.description}
              onChange={set('description')}
              rows={3}
              maxLength={1000}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-md text-[12px]"
              style={{ background: C.redDim, color: C.red, border: `1px solid rgba(217,68,68,0.2)`, fontFamily: 'Albert Sans, sans-serif' }}
            >
              <AlertCircle size={13} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div
            className="flex items-center justify-between pt-2"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <button
              type="button"
              onClick={onClose}
              className="text-[13px] transition-colors"
              style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.fg)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-8 rounded-md text-[12px] font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40 flex items-center gap-2"
              style={{ background: C.green, color: '#FFFFFF', fontFamily: 'Albert Sans, sans-serif' }}
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({
  resource,
  onClose,
  onDeleted,
}: {
  resource: ResourceResponse;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await resourceApi.delete(resource.id);
      toast.success('Resource deleted.');
      onDeleted();
    } catch {
      toast.error('Failed to delete resource. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,46,26,0.35)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-6 shadow-2xl"
        style={{ background: C.card, border: `1px solid rgba(217,68,68,0.3)` }}
      >
        <h2 className="font-serif text-[20px] mb-2" style={{ color: C.fg }}>Delete Resource?</h2>
        <p className="text-[13px] mb-6" style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}>
          <strong style={{ color: C.fg }}>{resource.name}</strong> will be permanently removed.
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-9 px-5 rounded-md text-[12px] font-semibold uppercase tracking-wider transition-colors"
            style={{ color: C.muted, border: `1px solid ${C.border}`, fontFamily: 'Albert Sans, sans-serif' }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="h-9 px-5 rounded-md text-[12px] font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40 flex items-center gap-2"
            style={{ background: C.red, color: '#FFFFFF', fontFamily: 'Albert Sans, sans-serif' }}
          >
            {deleting && <Loader2 size={12} className="animate-spin" />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const ResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isDomainAdmin = user?.role === 'DOMAIN_ADMIN';
  const canManage = isSuperAdmin || isDomainAdmin;

  // Data
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<{ id: string; name: string }[]>([]);

  // Filters
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<ResourceResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResourceResponse | null>(null);

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch domains (for super admin filter + form)
  useEffect(() => {
    if (isSuperAdmin) {
      api
        .get<{ id: string; name: string; isActive: boolean }[]>('/domains')
        .then((r) => setDomains(r.data.filter((d) => d.isActive)))
        .catch(() => { });
    }
  }, [isSuperAdmin]);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params: ResourceSearchParams = {};
      if (query) params.query = query;
      if (filterType) params.resourceType = filterType;
      if (filterStatus) params.status = filterStatus;
      if (filterDomain) params.domainId = filterDomain;
      // Domain admins are scoped server-side; no need to pass domainId

      const data = await resourceApi.search(params);
      setResources(data);
    } catch {
      toast.error('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  }, [query, filterType, filterStatus, filterDomain]);

  // Debounce query changes, immediate on filter changes
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(fetchResources, 300);
    return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); };
  }, [fetchResources]);

  const openCreate = () => { setEditTarget(null); setShowForm(true); };
  const openEdit = (r: ResourceResponse) => { setEditTarget(r); setShowForm(true); };

  const handleToggleStatus = async (r: ResourceResponse) => {
    try {
      await resourceApi.updateStatus(r.id, {
        status: r.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE',
      });
      const newStatus = r.status === 'ACTIVE' ? 'Out of Service' : 'Active';
      toast.success(`Resource marked as ${newStatus}.`);
      await fetchResources();   // ← now awaited
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const hasActiveFilters = filterType || filterStatus || filterDomain;

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto page-enter">

      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 mb-6 group"
        style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
      >
        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] group-hover:text-[#1A2E1A] transition-colors">
          Dashboard
        </span>
      </Link>

      {/* Page header */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-2"
              style={{ color: C.green, fontFamily: 'Albert Sans, sans-serif' }}
            >
              Campus
            </p>
            <h1
              className="font-serif leading-tight mb-1"
              style={{ color: C.fg, fontSize: 'clamp(26px, 3vw, 34px)' }}
            >
              Resource Catalog
            </h1>
            <p
              className="text-[14px] leading-relaxed"
              style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
            >
              Browse campus facilities, labs, and equipment available for booking.
            </p>
          </div>

          {/* Create button — admins only */}
          {canManage && (
            <button
              onClick={openCreate}
              className="shrink-0 h-10 px-5 rounded-md text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: C.green, color: '#FFFFFF', fontFamily: 'Albert Sans, sans-serif' }}
            >
              <Plus size={14} />
              New Resource
            </button>
          )}
        </div>
        <div
          className="mt-5 h-px"
          style={{ background: 'linear-gradient(90deg, #E2E8DF 0%, transparent 70%)' }}
        />
      </header>

      {/* Search + filter bar */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: C.muted }}
            />
            <input
              type="text"
              placeholder="Search by name or location…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-md text-[13px] outline-none transition-colors"
              style={{
                background: '#F2F5F0',
                border: `1px solid ${C.border}`,
                color: C.fg,
                fontFamily: 'Albert Sans, sans-serif',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = C.green; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: C.muted }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Toggle filters button */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="h-10 px-4 rounded-md text-[12px] font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors"
            style={{
              border: `1px solid ${hasActiveFilters ? C.green : C.border}`,
              color: hasActiveFilters ? C.green : C.muted,
              background: hasActiveFilters ? C.greenDim : 'transparent',
              fontFamily: 'Albert Sans, sans-serif',
            }}
          >
            Filters
            {hasActiveFilters && (
              <span
                className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ background: C.green, color: '#FFF' }}
              >
                {[filterType, filterStatus, filterDomain].filter(Boolean).length}
              </span>
            )}
            <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter dropdowns */}
        {showFilters && (
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg"
            style={{ background: '#F2F5F0', border: `1px solid ${C.border}` }}
          >
            {/* Type filter */}
            <div className="space-y-1.5">
              <p className={`${labelCls}`} style={labelStyle}>Type</p>
              <Select value={filterType || 'ALL'} onValueChange={(v) => setFilterType(v === 'ALL' ? '' : v)}>
                <SelectTrigger className="h-9 text-[12px] bg-white">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All types</SelectItem>
                  {RESOURCE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status filter */}
            <div className="space-y-1.5">
              <p className={`${labelCls}`} style={labelStyle}>Status</p>
              <Select value={filterStatus || 'ALL'} onValueChange={(v) => setFilterStatus(v === 'ALL' ? '' : v)}>
                <SelectTrigger className="h-9 text-[12px] bg-white">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Domain filter — super admin only */}
            {isSuperAdmin && (
              <div className="space-y-1.5">
                <p className={`${labelCls}`} style={labelStyle}>Domain</p>
                <Select value={filterDomain || 'ALL'} onValueChange={(v) => setFilterDomain(v === 'ALL' ? '' : v)}>
                  <SelectTrigger className="h-9 text-[12px] bg-white">
                    <SelectValue placeholder="All domains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All domains</SelectItem>
                    {domains.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Clear filters */}
            {hasActiveFilters && (
              <div className="sm:col-span-3 flex justify-end">
                <button
                  onClick={() => { setFilterType(''); setFilterStatus(''); setFilterDomain(''); }}
                  className="text-[11px] font-semibold uppercase tracking-wider transition-colors"
                  style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.red)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                >
                  × Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin" style={{ color: C.green }} />
        </div>
      ) : resources.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-lg"
          style={{ background: C.card, border: `1px dashed ${C.border}` }}
        >
          <div className="flex items-center gap-3 mb-6">
            {[BookMarked, FlaskConical, Library, Monitor].map((Icon, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={{ background: C.greenDim, opacity: 1 - i * 0.18 }}
              >
                <Icon size={16} style={{ color: C.green }} />
              </div>
            ))}
          </div>
          <p className="font-serif text-[22px] mb-2" style={{ color: C.fg }}>
            {query || hasActiveFilters ? 'No results found' : 'No resources yet'}
          </p>
          <p
            className="text-[13px] text-center max-w-xs"
            style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
          >
            {query || hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : canManage
                ? 'Create the first resource using the button above.'
                : 'Resources will appear here once they are added by an administrator.'}
          </p>
        </div>
      ) : (
        <>
          <p
            className="mb-4 text-[12px]"
            style={{ color: C.muted, fontFamily: 'Albert Sans, sans-serif' }}
          >
            {resources.length} resource{resources.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {resources.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                canManage={canManage}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <ResourceFormModal
          editing={editTarget}
          domains={domains}
          defaultDomainId={isDomainAdmin ? user?.domainId : undefined}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchResources(); }}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          resource={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); fetchResources(); }}
        />
      )}
    </div>
  );
};

export default ResourcesPage;