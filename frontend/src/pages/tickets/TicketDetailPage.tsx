import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTicket } from '@/hooks/useTickets';
import { ticketApi } from '@/lib/ticketApi';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { TicketPriorityBadge } from '@/components/tickets/TicketPriorityBadge';
import { TicketComments } from '@/components/tickets/TicketComments';
import { AttachmentUploader } from '@/components/tickets/AttachmentUploader';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { TicketStatus } from '@/types/ticket';

const STAFF_TRANSITIONS: Partial<Record<TicketStatus, TicketStatus[]>> = {
    OPEN: ['IN_PROGRESS'],
    IN_PROGRESS: ['RESOLVED'],
    RESOLVED: ['CLOSED'],
};
const ADMIN_EXTRA: TicketStatus[] = ['REJECTED'];

const STATUS_LABELS: Record<TicketStatus, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
};

const CATEGORY_LABELS: Record<string, string> = {
    ELECTRICAL: 'Electrical', PLUMBING: 'Plumbing', HVAC: 'HVAC',
    EQUIPMENT: 'Equipment', NETWORK: 'Network', OTHER: 'Other',
};

const TicketDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { ticket, isLoading, error, refetch } = useTicket(id!);

    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'DOMAIN_ADMIN';
    const isTechnician = user?.role === 'TECHNICIAN';
    const isOwner = ticket?.createdBy === user?.id;
    const isAssignedTech = isTechnician && ticket?.assignedTo === user?.id;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isDomainAdmin = user?.role === 'DOMAIN_ADMIN';
    // Domain admins can only reject if the ticket belongs to their domain
    const canReject = isSuperAdmin || (isDomainAdmin && (ticket.domainId === user?.domainId || !ticket.domainId));


    // Workflow state
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [resolutionNote, setResolutionNote] = useState('');
    const [technicianId, setTechnicianId] = useState('');
    const [isActing, setIsActing] = useState(false);

    // Pending attachments for upload on detail page
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

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
        if (!technicianId.trim()) return;
        setIsActing(true);
        try {
            await ticketApi.assign(id!, technicianId);
            toast.success('Technician assigned.');
            setTechnicianId('');
            refetch();
        } catch { toast.error('Failed to assign. Ensure the user ID belongs to a TECHNICIAN.'); }
        finally { setIsActing(false); }
    };

    const handleUploadPending = async () => {
        for (const file of pendingFiles) {
            try {
                await ticketApi.uploadAttachment(id!, file);
            } catch {
                toast.error(`Failed to upload ${file.name}`);
            }
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

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-destructive font-semibold mb-4">{error ?? 'Ticket not found.'}</p>
                    <Link to="/tickets" className="text-secondary hover:underline text-sm">Back to Tickets</Link>
                </div>
            </div>
        );
    }

    // Compute available next statuses
    let nextStatuses: TicketStatus[] = [];
    if (isAdmin) {
        const baseTransitions = STAFF_TRANSITIONS[ticket.status] ?? [];
        const adminExtras = canReject ? [...ADMIN_EXTRA] : [];
        nextStatuses = [...baseTransitions, ...adminExtras].filter((s) => s !== ticket.status);
    } else if (isAssignedTech) {
        nextStatuses = STAFF_TRANSITIONS[ticket.status] ?? [];
    }

    const canAddResolution = (isAssignedTech || isAdmin) && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED';
    const canAssign = isAdmin && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED';
    const canAddAttachment = (isOwner || isAdmin) && ticket.attachments.length < 3;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
            <header className="bg-primary text-primary-foreground py-8 px-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <Link
                        to="/tickets"
                        className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-white transition-colors flex items-center mb-4"
                    >
                        <span className="mr-2">←</span> All Tickets
                    </Link>
                    <div className="flex flex-wrap gap-4 items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <TicketStatusBadge status={ticket.status} />
                                <TicketPriorityBadge priority={ticket.priority} />
                            </div>
                            <h1 className="text-4xl font-serif mb-1">{ticket.location}</h1>
                            <p className="text-primary-foreground/70 font-light text-sm">
                                {CATEGORY_LABELS[ticket.category]} · Reported by {ticket.createdByName} ·{' '}
                                {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                            </p>
                        </div>
                        {nextStatuses.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {nextStatuses.map((s) => (
                                    <Button
                                        key={s}
                                        variant={s === 'REJECTED' ? 'destructive' : 'outline'}
                                        size="sm"
                                        disabled={isActing}
                                        onClick={() => handleStatusChange(s)}
                                        className={
                                            s !== 'REJECTED'
                                                ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 uppercase tracking-widest text-[10px] font-bold'
                                                : 'uppercase tracking-widest text-[10px] font-bold'
                                        }
                                    >
                                        Mark {STATUS_LABELS[s]}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main content — 2 cols */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Description */}
                    <section className="bg-card border border-border p-6 shadow-sm">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Description</h2>
                        <p className="text-base font-light leading-relaxed text-foreground whitespace-pre-wrap">
                            {ticket.description}
                        </p>
                    </section>

                    {/* Resolution notes */}
                    {ticket.resolutionNotes && (
                        <section className="bg-green-50 border border-green-200 p-6 shadow-sm">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-green-700 mb-3">Resolution Notes</h2>
                            <p className="text-sm font-light leading-relaxed text-green-900 whitespace-pre-wrap">
                                {ticket.resolutionNotes}
                            </p>
                        </section>
                    )}

                    {/* Rejection reason */}
                    {ticket.rejectionReason && (
                        <section className="bg-red-50 border border-red-200 p-6 shadow-sm">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-red-700 mb-3">Rejection Reason</h2>
                            <p className="text-sm font-light text-red-900">{ticket.rejectionReason}</p>
                        </section>
                    )}

                    {/* Linked ticket */}
                    {ticket.linkedTicketId && (
                        <section className="bg-yellow-50 border border-yellow-200 p-4">
                            <p className="text-xs text-yellow-700 font-semibold uppercase tracking-wider">
                                Linked to existing ticket —{' '}
                                <Link to={`/tickets/${ticket.linkedTicketId}`} className="underline">
                                    View →
                                </Link>
                            </p>
                        </section>
                    )}
                    {ticket.linkedReportersCount > 0 && (
                        <section className="bg-muted/50 border border-border p-4">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                {ticket.linkedReportersCount} additional reporter{ticket.linkedReportersCount > 1 ? 's' : ''} linked to this ticket
                            </p>
                        </section>
                    )}

                    {/* Attachments */}
                    <section className="bg-card border border-border p-6 shadow-sm">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                            Attachments ({ticket.attachments.length}/3)
                        </h2>
                        <AttachmentUploader
                            pendingFiles={pendingFiles}
                            onFilesChange={canAddAttachment ? setPendingFiles : () => { }}
                            maxFiles={3}
                            existingUrls={ticket.attachments.map((a) => ({
                                id: a.id,
                                filename: a.filename,
                                publicUrl: a.publicUrl,
                            }))}
                            onDeleteExisting={isOwner || isAdmin ? handleDeleteAttachment : undefined}
                        />
                        {pendingFiles.length > 0 && (
                            <Button
                                size="sm"
                                className="mt-3 uppercase tracking-widest text-xs font-bold"
                                onClick={handleUploadPending}
                                disabled={isActing}
                            >
                                Upload {pendingFiles.length} File{pendingFiles.length > 1 ? 's' : ''}
                            </Button>
                        )}
                    </section>

                    {/* Add resolution notes panel */}
                    {canAddResolution && (
                        <section className="bg-card border border-border p-6 shadow-sm">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Add Resolution Notes</h2>
                            <Textarea
                                placeholder="Describe the steps taken to resolve this issue..."
                                value={resolutionNote}
                                onChange={(e) => setResolutionNote(e.target.value)}
                                rows={4}
                                className="mb-4"
                            />
                            <Button
                                size="sm"
                                disabled={isActing || !resolutionNote.trim()}
                                onClick={handleAddResolution}
                                className="uppercase tracking-widest text-xs font-bold"
                            >
                                Save Notes
                            </Button>
                        </section>
                    )}

                    {/* Assign technician panel */}
                    {canAssign && (
                        <section className="bg-card border border-border p-6 shadow-sm">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                Assign Technician
                                {ticket.assignedToName && (
                                    <span className="ml-2 font-normal normal-case text-primary">
                                        (Currently: {ticket.assignedToName})
                                    </span>
                                )}
                            </h2>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Technician user ID (UUID)"
                                    value={technicianId}
                                    onChange={(e) => setTechnicianId(e.target.value)}
                                    className="h-10 text-sm"
                                />
                                <Button
                                    size="sm"
                                    disabled={isActing || !technicianId.trim()}
                                    onClick={handleAssign}
                                    className="uppercase tracking-widest text-[10px] font-bold whitespace-nowrap"
                                >
                                    Assign
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2">
                                Paste the UUID of a user with the TECHNICIAN role. A dropdown will be available once the personnel module exposes the technician list.
                            </p>
                        </section>
                    )}

                    {/* Comments */}
                    <TicketComments ticketId={ticket.id} currentUserId={user?.id ?? ''} />
                </div>

                {/* Sidebar — 1 col */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border p-6 shadow-sm space-y-5">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
                            Ticket Details
                        </h2>

                        <Detail label="Status"><TicketStatusBadge status={ticket.status} /></Detail>
                        <Detail label="Priority"><TicketPriorityBadge priority={ticket.priority} /></Detail>
                        <Detail label="Category">{CATEGORY_LABELS[ticket.category]}</Detail>
                        <Detail label="Location">{ticket.location}</Detail>
                        <Detail label="Reported By">{ticket.createdByName}</Detail>
                        <Detail label="Preferred Contact">{ticket.preferredContact}</Detail>
                        {ticket.assignedToName && (
                            <Detail label="Assigned To">{ticket.assignedToName}</Detail>
                        )}
                        {ticket.resourceId && (
                            <Detail label="Resource ID">
                                <span className="font-mono text-xs">{ticket.resourceId}</span>
                            </Detail>
                        )}
                        <Detail label="Created">{format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}</Detail>
                        <Detail label="Updated">{format(new Date(ticket.updatedAt), 'MMM dd, yyyy HH:mm')}</Detail>
                        <Detail label="Comments">{ticket.commentCount}</Detail>
                        {ticket.linkedReportersCount > 0 && (
                            <Detail label="Linked Reporters">{ticket.linkedReportersCount}</Detail>
                        )}
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
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            Reason for Rejection *
                        </Label>
                        <Textarea
                            placeholder="Explain why this ticket is being rejected..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isActing || !rejectionReason.trim()}>
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
            <div className="text-sm text-foreground font-medium">{children}</div>
        </div>
    );
}

export default TicketDetailPage;