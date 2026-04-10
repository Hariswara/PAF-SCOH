import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTicket } from '@/hooks/useTickets';
import { ticketApi } from '@/lib/ticketApi';
import api from '@/lib/api';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { TicketPriorityBadge } from '@/components/tickets/TicketPriorityBadge';
import { TicketComments } from '@/components/tickets/TicketComments';
import { AttachmentUploader } from '@/components/tickets/AttachmentUploader';
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, Link2, AlertTriangle, Loader2 } from 'lucide-react';
import type { TicketResponse, TicketStatus, TechnicianOption } from '@/types/ticket';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<TicketStatus, string> = {
    OPEN: 'Open', IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved', CLOSED: 'Closed', REJECTED: 'Rejected',
};

const CATEGORY_LABELS: Record<string, string> = {
    ELECTRICAL: 'Electrical', PLUMBING: 'Plumbing', HVAC: 'HVAC',
    EQUIPMENT: 'Equipment', NETWORK: 'Network', OTHER: 'Other',
};

// Only staff (assigned tech / admin) can transition — students see no buttons
const STAFF_TRANSITIONS: Partial<Record<TicketStatus, TicketStatus[]>> = {
    OPEN: ['IN_PROGRESS'],
    IN_PROGRESS: ['RESOLVED'],
    RESOLVED: ['CLOSED'],
};
const ADMIN_EXTRA: TicketStatus[] = ['REJECTED'];

interface Domain {
    id: string;
    name: string;
    isActive: boolean;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TicketDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { ticket, isLoading, error, refetch } = useTicket(id!);

    // ── Role flags
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isDomainAdmin = user?.role === 'DOMAIN_ADMIN';
    const isAdmin = isSuperAdmin || isDomainAdmin;
    const isTechnician = user?.role === 'TECHNICIAN';
    const isOwner = ticket?.createdBy === user?.id;
    const isAssignedTech = isTechnician && ticket?.assignedTo === user?.id;

    // Domain admins can only reject tickets in their own domain
    const userDomainId = (user as { domainId?: string } | null)?.domainId;
    const canReject = isSuperAdmin
        || (isDomainAdmin && (!ticket?.domainId || ticket.domainId === userDomainId));

    // ── Permission gates
    const canAssign = isAdmin && ticket?.status !== 'CLOSED' && ticket?.status !== 'REJECTED';
    const canAddResolution = (isAssignedTech || isAdmin)
        && ticket?.status !== 'CLOSED' && ticket?.status !== 'REJECTED';
    const canAddAttachment = (isOwner || isAdmin) && (ticket?.attachments.length ?? 0) < 3;

    // ── Workflow UI state
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [resolutionNote, setResolutionNote] = useState('');
    const [isActing, setIsActing] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [attachmentError, setAttachmentError] = useState<string | null>(null);
    const [domainNameById, setDomainNameById] = useState<Record<string, string>>({});

    // ── Technician dropdown state (fix #4)
    const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
    const [technicianId, setTechnicianId] = useState('');

    useEffect(() => {
        if (canAssign) {
            ticketApi.getTechnicians()
                .then(setTechnicians)
                .catch(() => {/* non-critical */ });
        }
    }, [canAssign]);

    useEffect(() => {
        if (!ticket?.domainId) return;

        let cancelled = false;
        api.get<Domain[]>('/domains')
            .then((response) => {
                if (cancelled) return;
                const map = Object.fromEntries(response.data.map((d) => [d.id, d.name]));
                setDomainNameById(map);
            })
            .catch(() => {
                // Non-blocking; UI falls back to displaying the raw domain UUID.
            });

        return () => {
            cancelled = true;
        };
    }, [ticket?.domainId]);

    // ── Linked parent ticket state ───────────────────────────────────────────
    //
    // Java serialises UUID fields as plain strings in the JSON response.
    // We coerce to string just in case and keep a dedicated loading flag so
    // the UI shows a spinner rather than "Loading…" text that never resolves.
    //
    const linkedId = ticket?.linkedTicketId ? String(ticket.linkedTicketId) : null;

    const [linkedParent, setLinkedParent] = useState<TicketResponse | null>(null);
    const [linkedParentLoading, setLinkedParentLoading] = useState(false);
    const [linkedParentError, setLinkedParentError] = useState(false);
    const [linkedReports, setLinkedReports] = useState<TicketResponse[]>([]);
    const [linkedReportsLoading, setLinkedReportsLoading] = useState(false);

    useEffect(() => {
        if (!linkedId) {
            setLinkedParent(null);
            setLinkedParentError(false);
            return;
        }
        let cancelled = false;
        setLinkedParentLoading(true);
        setLinkedParentError(false);
        ticketApi.getById(linkedId)
            .then((data) => {
                if (!cancelled) setLinkedParent(data);
            })
            .catch(() => {
                if (!cancelled) setLinkedParentError(true);
            })
            .finally(() => {
                if (!cancelled) setLinkedParentLoading(false);
            });
        return () => { cancelled = true; };
    }, [linkedId]);

    useEffect(() => {
        if (!ticket || linkedId) {
            setLinkedReports([]);
            return;
        }

        let cancelled = false;
        setLinkedReportsLoading(true);
        ticketApi.getLinkedReports(ticket.id)
            .then((data) => {
                if (!cancelled) setLinkedReports(data);
            })
            .catch(() => {
                if (!cancelled) setLinkedReports([]);
            })
            .finally(() => {
                if (!cancelled) setLinkedReportsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [ticket, linkedId]);

    // ── Next-status computation (fix #1 — students see no buttons)
    let nextStatuses: TicketStatus[] = [];
    if (isAdmin && ticket) {
        const base = STAFF_TRANSITIONS[ticket.status] ?? [];
        const extras = canReject ? ADMIN_EXTRA : [];
        nextStatuses = [...base, ...extras].filter((s) => s !== ticket.status);
    } else if (isAssignedTech && ticket) {
        nextStatuses = STAFF_TRANSITIONS[ticket.status] ?? [];
    }

    // ── Handlers

    const handleStatusChange = async (status: TicketStatus) => {
        if (status === 'REJECTED') { setRejectDialogOpen(true); return; }
        setIsActing(true);
        try {
            await ticketApi.updateStatus(id!, status);
            toast.success(`Ticket moved to ${STATUS_LABELS[status]}`);
            refetch();
        } catch { toast.error('Failed to update status.'); }
        finally { setIsActing(false); }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) { toast.error('Please provide a rejection reason.'); return; }
        setIsActing(true);
        try {
            await ticketApi.updateStatus(id!, 'REJECTED', rejectionReason);
            toast.success('Ticket rejected.');
            setRejectDialogOpen(false);
            refetch();
        } catch { toast.error('Failed to reject ticket.'); }
        finally { setIsActing(false); }
    };

    const handleAddResolution = async () => {
        if (!resolutionNote.trim()) return;
        setIsActing(true);
        try {
            await ticketApi.addResolution(id!, resolutionNote);
            toast.success('Resolution notes saved.');
            setResolutionNote('');
            refetch();
        } catch { toast.error('Failed to save resolution notes.'); }
        finally { setIsActing(false); }
    };

    const handleAssign = async () => {
        if (!technicianId || technicianId === '_none') return;
        setIsActing(true);
        try {
            await ticketApi.assign(id!, technicianId);
            toast.success('Technician assigned.');
            setTechnicianId('');
            refetch();
        } catch { toast.error('Failed to assign technician.'); }
        finally { setIsActing(false); }
    };

    const handleUploadPending = async () => {
        for (const file of pendingFiles) {
            try { await ticketApi.uploadAttachment(id!, file); }
            catch { toast.error(`Failed to upload ${file.name}`); }
        }
        setPendingFiles([]);
        toast.success('Attachments uploaded.');
        refetch();
    };

    const handleDeleteAttachment = async (attachmentId: string) => {
        try {
            await ticketApi.deleteAttachment(id!, attachmentId);
            toast.success('Attachment removed.');
            refetch();
        } catch { toast.error('Failed to remove attachment.'); }
    };

    // ── Guards

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="w-8 h-8 rounded-full border-[3px] animate-spin"
                    style={{ borderColor: '#2D7A3A', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <p className="mb-4 text-[14px]" style={{ color: '#D94444', fontFamily: 'Albert Sans, sans-serif' }}>
                        {error ?? 'Ticket not found.'}
                    </p>
                    <Link to="/tickets" className="text-[13px] underline" style={{ color: '#2D7A3A' }}>
                        Back to Tickets
                    </Link>
                </div>
            </div>
        );
    }

    // Whether linked ticket section is visible to this user
    const canSeeLinked = isAdmin || isTechnician || isOwner;

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
                    All Tickets
                </span>
            </Link>

            {/* Page header */}
            <header className="mb-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <TicketStatusBadge status={ticket.status} />
                            <TicketPriorityBadge priority={ticket.priority} />
                        </div>
                        <h1
                            className="font-serif leading-tight mb-1"
                            style={{ color: '#1A2E1A', fontSize: 'clamp(24px, 2.5vw, 32px)' }}
                        >
                            {ticket.location}
                        </h1>
                        <p className="text-[13px]" style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}>
                            {CATEGORY_LABELS[ticket.category]}
                            {(isAdmin || isOwner) && ` · Reported by ${ticket.createdByName}`}
                            {' · '}{format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                        </p>
                    </div>

                    {nextStatuses.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {nextStatuses.map((s) => (
                                <button
                                    key={s}
                                    disabled={isActing}
                                    onClick={() => handleStatusChange(s)}
                                    className="h-8 px-4 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40"
                                    style={{
                                        background: s === 'REJECTED' ? 'rgba(217,68,68,0.1)' : 'rgba(45,122,58,0.1)',
                                        color: s === 'REJECTED' ? '#D94444' : '#2D7A3A',
                                        border: `1px solid ${s === 'REJECTED' ? 'rgba(217,68,68,0.25)' : 'rgba(45,122,58,0.25)'}`,
                                        fontFamily: 'Albert Sans, sans-serif',
                                    }}
                                >
                                    Mark {STATUS_LABELS[s]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mt-5 h-px" style={{ background: 'linear-gradient(90deg, #E2E8DF 0%, transparent 70%)' }} />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Main — 2 cols ─────────────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Description */}
                    <Card title="Description">
                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap"
                            style={{ color: '#1A2E1A', fontFamily: 'Albert Sans, sans-serif' }}>
                            {ticket.description}
                        </p>
                    </Card>

                    {/* Resolution notes (display) */}
                    {ticket.resolutionNotes && (
                        <div className="rounded-lg p-5" style={{ background: '#F0FBF1', border: '1px solid #B9E4BD' }}>
                            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
                                style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}>
                                Resolution Notes
                            </h2>
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap"
                                style={{ color: '#1A2E1A', fontFamily: 'Albert Sans, sans-serif' }}>
                                {ticket.resolutionNotes}
                            </p>
                        </div>
                    )}

                    {/* Rejection reason */}
                    {ticket.rejectionReason && (
                        <div className="rounded-lg p-5" style={{ background: '#FFF5F5', border: '1px solid #FFCDD2' }}>
                            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
                                style={{ color: '#D94444', fontFamily: 'Albert Sans, sans-serif' }}>
                                Rejection Reason
                            </h2>
                            <p className="text-[13px]" style={{ color: '#7F1D1D', fontFamily: 'Albert Sans, sans-serif' }}>
                                {ticket.rejectionReason}
                            </p>
                        </div>
                    )}

                    {/* ── Linked parent ticket — visible to admin, technician, owner ── */}
                    {linkedId && canSeeLinked && (
                        <div className="rounded-lg p-5" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <Link2 size={13} style={{ color: '#D97706' }} />
                                <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                                    style={{ color: '#92400E', fontFamily: 'Albert Sans, sans-serif' }}>
                                    Linked to Existing Ticket
                                </h2>
                            </div>

                            {linkedParentLoading && (
                                <div className="flex items-center gap-2 py-2">
                                    <Loader2 size={14} className="animate-spin" style={{ color: '#D97706' }} />
                                    <span className="text-[12px]" style={{ color: '#92400E', fontFamily: 'Albert Sans, sans-serif' }}>
                                        Loading linked ticket…
                                    </span>
                                </div>
                            )}

                            {!linkedParentLoading && linkedParentError && (
                                <p className="text-[12px]" style={{ color: '#D94444', fontFamily: 'Albert Sans, sans-serif' }}>
                                    Could not load linked ticket.{' '}
                                    <Link to={`/tickets/${linkedId}`} className="underline" style={{ color: '#2D7A3A' }}>
                                        Open directly →
                                    </Link>
                                </p>
                            )}

                            {!linkedParentLoading && !linkedParentError && linkedParent && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <TicketStatusBadge status={linkedParent.status} />
                                        <TicketPriorityBadge priority={linkedParent.priority} />
                                        <span className="text-[10px] font-mono opacity-40" style={{ color: '#92400E' }}>
                                            #{linkedParent.id.slice(0, 8)}
                                        </span>
                                    </div>
                                    <p className="text-[14px] font-semibold"
                                        style={{ color: '#1A2E1A', fontFamily: 'Albert Sans, sans-serif' }}>
                                        {linkedParent.location}
                                    </p>
                                    <p className="text-[12px] leading-relaxed line-clamp-2"
                                        style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}>
                                        {linkedParent.description}
                                    </p>
                                    <div className="flex items-center gap-4 pt-1">
                                        <Link
                                            to={`/tickets/${linkedParent.id}`}
                                            className="text-[11px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-70"
                                            style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
                                        >
                                            View parent ticket →
                                        </Link>
                                        <span className="text-[11px]" style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}>
                                            {CATEGORY_LABELS[linkedParent.category]} · {format(new Date(linkedParent.createdAt), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Linked reporters count — visible to any viewer of this ticket */}
                    {ticket.linkedReportersCount > 0 && (
                        <div className="rounded-lg p-4 flex items-center gap-3"
                            style={{ background: '#F2F5F0', border: '1px solid #E2E8DF' }}>
                            <AlertTriangle size={14} style={{ color: '#D97706', flexShrink: 0 }} />
                            <p className="text-[12px] font-semibold uppercase tracking-wider"
                                style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}>
                                {ticket.linkedReportersCount} additional reporter
                                {ticket.linkedReportersCount > 1 ? 's' : ''} linked to this ticket
                            </p>
                        </div>
                    )}

                    {!linkedId && (linkedReportsLoading || linkedReports.length > 0) && (
                        <Card title="Linked Reports">
                            {linkedReportsLoading ? (
                                <div className="flex items-center gap-2 py-1">
                                    <Loader2 size={14} className="animate-spin" style={{ color: '#6B7B6B' }} />
                                    <span className="text-[12px]" style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}>
                                        Loading linked reports...
                                    </span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {linkedReports.map((report) => (
                                        <Link
                                            key={report.id}
                                            to={`/tickets/${report.id}`}
                                            className="block rounded-md p-3 transition-colors hover:bg-[#F2F5F0]"
                                            style={{ border: '1px solid #E2E8DF' }}
                                        >
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <TicketStatusBadge status={report.status} />
                                                <TicketPriorityBadge priority={report.priority} />
                                                <span className="text-[10px] font-mono opacity-50" style={{ color: '#6B7B6B' }}>
                                                    #{report.id.slice(0, 8)}
                                                </span>
                                            </div>
                                            <p className="text-[13px] font-semibold" style={{ color: '#1A2E1A', fontFamily: 'Albert Sans, sans-serif' }}>
                                                {report.location}
                                            </p>
                                            <p className="text-[12px] line-clamp-1" style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}>
                                                {report.description}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Attachments */}
                    <Card title={`Attachments (${ticket.attachments.length}/3)`}>
                        <AttachmentUploader
                            pendingFiles={pendingFiles}
                            onFilesChange={canAddAttachment
                                ? (files) => { setAttachmentError(null); setPendingFiles(files); }
                                : () => { }
                            }
                            maxFiles={3}
                            existingUrls={ticket.attachments.map((a) => ({
                                id: a.id, filename: a.filename, publicUrl: a.publicUrl,
                            }))}
                            onDeleteExisting={isOwner || isAdmin ? handleDeleteAttachment : undefined}
                            onError={setAttachmentError}
                        />
                        {attachmentError && (
                            <p className="text-[12px] mt-2" style={{ color: '#D94444', fontFamily: 'Albert Sans, sans-serif' }}>
                                {attachmentError}
                            </p>
                        )}
                        {pendingFiles.length > 0 && (
                            <button
                                onClick={handleUploadPending}
                                disabled={isActing}
                                className="mt-3 h-8 px-4 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40"
                                style={{ background: '#2D7A3A', color: '#FFFFFF', fontFamily: 'Albert Sans, sans-serif' }}
                            >
                                Upload {pendingFiles.length} File{pendingFiles.length > 1 ? 's' : ''}
                            </button>
                        )}
                    </Card>

                    {/* Add resolution notes */}
                    {canAddResolution && (
                        <Card title="Add Resolution Notes">
                            <Textarea
                                placeholder="Describe the steps taken to resolve this issue…"
                                value={resolutionNote}
                                onChange={(e) => setResolutionNote(e.target.value)}
                                rows={4}
                                className="mb-3"
                            />
                            <button
                                disabled={isActing || !resolutionNote.trim()}
                                onClick={handleAddResolution}
                                className="h-8 px-4 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40"
                                style={{ background: '#2D7A3A', color: '#FFFFFF', fontFamily: 'Albert Sans, sans-serif' }}
                            >
                                Save Notes
                            </button>
                        </Card>
                    )}

                    {/* ── Assign technician — dropdown (fix #4) ── */}
                    {canAssign && (
                        <Card title="Assign Technician">
                            <div className="flex gap-3 items-start">
                                <Select value={technicianId} onValueChange={setTechnicianId}>
                                    <SelectTrigger className="flex-1 h-9 text-[13px]">
                                        <SelectValue placeholder="Select a technician…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {technicians.length === 0 ? (
                                            <SelectItem value="_none" disabled>
                                                No active technicians found
                                            </SelectItem>
                                        ) : (
                                            technicians.map((t) => (
                                                <SelectItem key={t.id} value={t.id}>
                                                    <span>{t.fullName}</span>
                                                    <span
                                                        className="ml-1.5 text-[11px]"
                                                        style={{ color: '#6B7B6B' }}
                                                    >
                                                        {t.email}
                                                    </span>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <button
                                    disabled={isActing || !technicianId || technicianId === '_none'}
                                    onClick={handleAssign}
                                    className="h-9 px-4 rounded-md text-[12px] font-semibold uppercase tracking-wider shrink-0 transition-opacity disabled:opacity-40"
                                    style={{ background: '#2D7A3A', color: '#FFFFFF', fontFamily: 'Albert Sans, sans-serif' }}
                                >
                                    Assign
                                </button>
                            </div>
                            {ticket.assignedToName && (
                                <p className="text-[11px] mt-2" style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}>
                                    Currently assigned to:{' '}
                                    <strong style={{ color: '#1A2E1A' }}>{ticket.assignedToName}</strong>
                                </p>
                            )}
                        </Card>
                    )}

                    {/* Comments */}
                    <TicketComments ticketId={ticket.id} currentUserId={user?.id ?? ''} />
                </div>

                {/* ── Sidebar — 1 col ───────────────────────────────────────────── */}
                <aside className="lg:col-span-1 space-y-4">
                    <div className="rounded-lg p-5 space-y-4"
                        style={{ background: '#FFFFFF', border: '1px solid #E2E8DF' }}>
                        <h2
                            className="text-[10px] font-semibold uppercase tracking-[0.18em] pb-3"
                            style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif', borderBottom: '1px solid #E2E8DF' }}
                        >
                            Ticket Details
                        </h2>

                        <Detail label="Status"><TicketStatusBadge status={ticket.status} /></Detail>
                        <Detail label="Priority"><TicketPriorityBadge priority={ticket.priority} /></Detail>
                        <Detail label="Category">{CATEGORY_LABELS[ticket.category]}</Detail>
                        <Detail label="Domain">
                            {ticket.domainId
                                ? (domainNameById[ticket.domainId] ?? ticket.domainId)
                                : 'N/A'}
                        </Detail>
                        <Detail label="Location">{ticket.location}</Detail>

                        {/* Privacy fix #9 — hide reporter info from non-owner non-admin */}
                        {(isAdmin || isOwner) && (
                            <Detail label="Reported By">{ticket.createdByName}</Detail>
                        )}
                        {(isAdmin || isOwner) && (
                            <Detail label="Preferred Contact">{ticket.preferredContact}</Detail>
                        )}

                        {ticket.assignedToName && (
                            <Detail label="Assigned To">{ticket.assignedToName}</Detail>
                        )}

                        {/* Linked ticket in sidebar — shown to admin, technician, owner */}
                        {linkedId && canSeeLinked && (
                            <Detail label="Linked To">
                                {linkedParentLoading ? (
                                    <span className="flex items-center gap-1.5 text-[12px]" style={{ color: '#6B7B6B' }}>
                                        <Loader2 size={11} className="animate-spin" /> Loading…
                                    </span>
                                ) : linkedParent ? (
                                    <Link
                                        to={`/tickets/${linkedParent.id}`}
                                        className="inline-flex items-center gap-1 text-[12px] underline"
                                        style={{ color: '#2D7A3A' }}
                                    >
                                        <Link2 size={11} />
                                        {linkedParent.location}
                                    </Link>
                                ) : (
                                    <Link
                                        to={`/tickets/${linkedId}`}
                                        className="inline-flex items-center gap-1 text-[12px] underline"
                                        style={{ color: '#2D7A3A' }}
                                    >
                                        <Link2 size={11} /> View ticket
                                    </Link>
                                )}
                            </Detail>
                        )}

                        {ticket.linkedReportersCount > 0 && (
                            <Detail label="Linked Reporters">
                                <span
                                    className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
                                    style={{ background: 'rgba(217,119,6,0.1)', color: '#92400E' }}
                                >
                                    {ticket.linkedReportersCount}
                                </span>
                            </Detail>
                        )}

                        <Detail label="Created">
                            {format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}
                        </Detail>
                        <Detail label="Updated">
                            {format(new Date(ticket.updatedAt), 'MMM dd, yyyy HH:mm')}
                        </Detail>
                        <Detail label="Comments">{ticket.commentCount}</Detail>
                    </div>
                </aside>
            </div>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Ticket</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <Label
                            className="text-[10px] uppercase tracking-wider font-semibold"
                            style={{ color: '#6B7B6B' }}
                        >
                            Reason for Rejection *
                        </Label>
                        <Textarea
                            placeholder="Explain why this ticket is being rejected…"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => setRejectDialogOpen(false)}
                            className="h-9 px-4 rounded-md text-[12px] font-semibold uppercase tracking-wider"
                            style={{
                                background: 'transparent', color: '#6B7B6B',
                                border: '1px solid #E2E8DF', fontFamily: 'Albert Sans, sans-serif',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={isActing || !rejectionReason.trim()}
                            className="h-9 px-4 rounded-md text-[12px] font-semibold uppercase tracking-wider transition-opacity disabled:opacity-40"
                            style={{ background: '#D94444', color: '#FFFFFF', fontFamily: 'Albert Sans, sans-serif' }}
                        >
                            Confirm Rejection
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg p-5" style={{ background: '#FFFFFF', border: '1px solid #E2E8DF' }}>
            <h2
                className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-4"
                style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
            >
                {title}
            </h2>
            {children}
        </div>
    );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p
                className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1"
                style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
            >
                {label}
            </p>
            <div
                className="text-[13px] font-medium"
                style={{ color: '#1A2E1A', fontFamily: 'Albert Sans, sans-serif' }}
            >
                {children}
            </div>
        </div>
    );
}

export default TicketDetailPage;