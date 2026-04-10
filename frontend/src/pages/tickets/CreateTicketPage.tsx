import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ticketApi } from '@/lib/ticketApi';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DuplicateSidebar } from '@/components/tickets/DuplicateSidebar';
import { AttachmentUploader } from '@/components/tickets/AttachmentUploader';
import { toast } from 'sonner';
import { ArrowLeft, FileWarning } from 'lucide-react';
import type { TicketCategory, TicketPriority, DuplicateSuggestion } from '@/types/ticket';

const CATEGORIES: { value: TicketCategory; label: string }[] = [
    { value: 'ELECTRICAL', label: 'Electrical' },
    { value: 'PLUMBING', label: 'Plumbing' },
    { value: 'HVAC', label: 'HVAC / Air Conditioning' },
    { value: 'EQUIPMENT', label: 'Equipment / Hardware' },
    { value: 'NETWORK', label: 'Network / Connectivity' },
    { value: 'OTHER', label: 'Other' },
];

const PRIORITIES: { value: TicketPriority; label: string; hint: string }[] = [
    { value: 'LOW', label: 'Low', hint: 'Minor inconvenience, can wait.' },
    { value: 'MEDIUM', label: 'Medium', hint: 'Affects work, needs timely resolution.' },
    { value: 'HIGH', label: 'High', hint: 'Significantly impacts operations.' },
    { value: 'CRITICAL', label: 'Critical', hint: 'Immediate danger or total blockage.' },
];

const CreateTicketPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isDomainAdmin = user?.role === 'DOMAIN_ADMIN';

    const [form, setForm] = useState({
        location: '',
        category: '' as TicketCategory | '',
        description: '',
        priority: '' as TicketPriority | '',
        preferredContact: user?.email ?? '',
        domainId: '',   // Fix #6
    });

    const [linkedTicketId, setLinkedTicketId] = useState<string | undefined>(undefined);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [attachmentError, setAttachmentError] = useState<string | null>(null);

    const [domains, setDomains] = useState<{ id: string; name: string }[]>([]);
    useEffect(() => {
        if (!isDomainAdmin) {
            api.get<{ id: string; name: string; isActive: boolean }[]>('/domains')
                .then((r) => setDomains(r.data.filter((d) => d.isActive)))
                .catch(() => { });
        }
    }, [isDomainAdmin]);

    const [suggestions, setSuggestions] = useState<DuplicateSuggestion[]>([]);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (form.description.trim().length < 10) { setSuggestions([]); return; }

        debounceRef.current = setTimeout(async () => {
            try {
                const results = await ticketApi.checkDuplicates(
                    form.description,
                    form.location || undefined,
                    form.category || undefined,
                    form.domainId || undefined,
                );
                setSuggestions(results);
            } catch { /* silently ignore */ }
        }, 600);

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [form.description, form.location, form.domainId]);

    const handleChange =
        (field: keyof typeof form) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSelectChange = (field: keyof typeof form) => (value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.category || !form.priority) {
            setFormError('Please select a category and priority.');
            return;
        }
        if (!isDomainAdmin && !form.domainId) {
            setFormError('Please select a department / domain.');
            return;
        }
        setIsSubmitting(true);
        setFormError(null);

        try {
            const ticket = await ticketApi.create({
                location: form.location,
                category: form.category as TicketCategory,
                description: form.description,
                priority: form.priority as TicketPriority,
                preferredContact: form.preferredContact,
                domainId: form.domainId || undefined,
                linkedTicketId,
            });

            for (const file of pendingFiles) {
                try {
                    await ticketApi.uploadAttachment(ticket.id, file);
                } catch {
                    toast.error(`Failed to upload ${file.name}. You can add it from the ticket detail page.`);
                }
            }

            toast.success('Ticket submitted successfully.');
            navigate(`/tickets/${ticket.id}`);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'Failed to submit ticket. Please try again.';
            setFormError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const labelCls = 'text-[10px] uppercase tracking-[0.18em] font-semibold';
    const labelStyle = { color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' };
    const inputCls = 'h-10 text-[13px] bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-[#2D7A3A] px-0';

    return (
        <div className="p-6 sm:p-8 max-w-[1400px] mx-auto page-enter">

            {/* Back */}
            <Link
                to="/tickets"
                className="inline-flex items-center gap-1.5 mb-6 group"
                style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
            >
                <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] group-hover:text-[#1A2E1A] transition-colors">
                    Back to Tickets
                </span>
            </Link>

            {/* Header */}
            <header className="mb-8">
                <p
                    className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-2"
                    style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
                >
                    Support
                </p>
                <h1
                    className="font-serif leading-tight mb-1"
                    style={{ color: '#1A2E1A', fontSize: 'clamp(26px, 3vw, 34px)' }}
                >
                    Report an Incident
                </h1>
                <p className="text-[14px]" style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}>
                    Provide accurate details so technicians can address the issue efficiently.
                </p>
                <div className="mt-5 h-px" style={{ background: 'linear-gradient(90deg, #E2E8DF 0%, transparent 70%)' }} />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Form — 2 cols */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

                    {formError && (
                        <div
                            className="flex items-start gap-3 p-4 rounded-md text-[13px]"
                            style={{ background: 'rgba(217,68,68,0.06)', border: '1px solid rgba(217,68,68,0.2)', color: '#D94444', fontFamily: 'Albert Sans, sans-serif' }}
                        >
                            <FileWarning size={15} className="mt-0.5 shrink-0" />
                            {formError}
                        </div>
                    )}

                    {/* Domain selector (students only; domain admins skip) */}
                    {!isDomainAdmin && (
                        <div className="space-y-2">
                            <Label className={labelCls} style={labelStyle}>Department / Domain *</Label>
                            <Select
                                value={form.domainId}
                                onValueChange={handleSelectChange('domainId')}
                                required
                            >
                                <SelectTrigger className="h-10 text-[13px]">
                                    <SelectValue placeholder="Select the relevant department…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {domains.length === 0 ? (
                                        <SelectItem value="_none" disabled>Loading domains…</SelectItem>
                                    ) : (
                                        domains.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Location */}
                    <div className="space-y-2">
                        <Label className={labelCls} style={labelStyle}>Location *</Label>
                        <Input
                            placeholder="e.g. Lab 301, Building A, 3rd Floor"
                            value={form.location}
                            onChange={handleChange('location')}
                            required
                            className={inputCls}
                            style={{ borderBottomColor: '#E2E8DF' }}
                        />
                    </div>

                    {/* Category & Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className={labelCls} style={labelStyle}>Category *</Label>
                            <Select
                                value={form.category}
                                onValueChange={handleSelectChange('category')}
                                required
                            >
                                <SelectTrigger className="h-10 text-[13px]">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className={labelCls} style={labelStyle}>Priority *</Label>
                            <Select
                                value={form.priority}
                                onValueChange={handleSelectChange('priority')}
                                required
                            >
                                <SelectTrigger className="h-10 text-[13px]">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITIES.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            <span className="font-semibold">{p.label}</span>
                                            <span className="ml-1 text-[11px] opacity-50">— {p.hint}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className={labelCls} style={labelStyle}>Description *</Label>
                        <Textarea
                            placeholder="Describe the issue in detail — what is broken, the symptoms, when it started."
                            value={form.description}
                            onChange={handleChange('description')}
                            required
                            minLength={10}
                            rows={5}
                        />
                        <p className="text-[10px]" style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}>
                            Minimum 10 characters.
                        </p>
                    </div>

                    {/* Preferred Contact */}
                    <div className="space-y-2">
                        <Label className={labelCls} style={labelStyle}>Preferred Contact *</Label>
                        <Input
                            placeholder="e.g. your email or phone number"
                            value={form.preferredContact}
                            onChange={handleChange('preferredContact')}
                            required
                            className={inputCls}
                            style={{ borderBottomColor: '#E2E8DF' }}
                        />
                    </div>

                    {/* Attachment Uploader*/}
                    <div className="space-y-2">
                        <Label className={labelCls} style={labelStyle}>
                            Evidence Images{' '}
                            <span className="normal-case font-normal opacity-50">(up to 3)</span>
                        </Label>
                        <AttachmentUploader
                            pendingFiles={pendingFiles}
                            onFilesChange={(files) => { setAttachmentError(null); setPendingFiles(files); }}
                            maxFiles={3}
                            onError={setAttachmentError}
                        />
                        {attachmentError && (
                            <p
                                className="text-[12px] flex items-center gap-1.5"
                                style={{ color: '#D94444', fontFamily: 'Albert Sans, sans-serif' }}
                            >
                                <FileWarning size={12} /> {attachmentError}
                            </p>
                        )}
                    </div>

                    {/* Linked ticket notice */}
                    {linkedTicketId && (
                        <div
                            className="p-4 rounded-md text-[13px] flex items-start justify-between gap-4"
                            style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid #FDE68A', color: '#92400E', fontFamily: 'Albert Sans, sans-serif' }}
                        >
                            <span>Your report will be linked to an existing ticket. The assigned technician will be notified.</span>
                            <button
                                type="button"
                                className="text-[11px] underline shrink-0"
                                onClick={() => setLinkedTicketId(undefined)}
                            >
                                Unlink
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    <div
                        className="flex justify-between items-center pt-4"
                        style={{ borderTop: '1px solid #E2E8DF' }}
                    >
                        <Link
                            to="/tickets"
                            className="text-[13px] transition-colors"
                            style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#1A2E1A')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7B6B')}
                        >
                            ← Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-10 px-8 rounded-md text-[12px] font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40"
                            style={{ background: '#2D7A3A', color: '#FFFFFF', fontFamily: 'Albert Sans, sans-serif' }}
                        >
                            {isSubmitting ? 'Submitting…' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>

                {/* Duplicate sidebar */}
                <aside className="lg:col-span-1">
                    <DuplicateSidebar
                        suggestions={suggestions}
                        onLink={(id) => setLinkedTicketId(id)}
                        linkedId={linkedTicketId}
                    />
                </aside>
            </div>
        </div>
    );
};

export default CreateTicketPage;