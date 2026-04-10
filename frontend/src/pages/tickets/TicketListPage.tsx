import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMyTickets, useAllTickets, useAssignedTickets } from '@/hooks/useTickets';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { TicketPriorityBadge } from '@/components/tickets/TicketPriorityBadge';
import { format } from 'date-fns';
import { Plus, Ticket as TicketIcon } from 'lucide-react';
import type { TicketResponse } from '@/types/ticket';

const CATEGORY_LABELS: Record<string, string> = {
    ELECTRICAL: 'Electrical', PLUMBING: 'Plumbing', HVAC: 'HVAC',
    EQUIPMENT: 'Equipment', NETWORK: 'Network', OTHER: 'Other',
};

// ─── Ticket table ─────────────────────────────────────────────────────────────

function TicketTable({ tickets, isLoading }: { tickets: TicketResponse[]; isLoading: boolean }) {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div
                    className="w-8 h-8 rounded-full border-[3px] animate-spin"
                    style={{ borderColor: '#2D7A3A', borderTopColor: 'transparent' }}
                />
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div
                className="py-20 text-center text-[14px] rounded-md"
                style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif', border: '1px dashed #E2E8DF' }}
            >
                No tickets found.
            </div>
        );
    }

    return (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #E2E8DF' }}>
            <Table>
                <TableHeader>
                    <TableRow style={{ background: '#F2F5F0', borderBottom: '1px solid #E2E8DF' }}>
                        {['Location / Category', 'Priority', 'Status', 'Reported', 'Assigned To', ''].map((h) => (
                            <TableHead
                                key={h}
                                className="text-[10px] font-semibold uppercase tracking-[0.18em] py-3.5"
                                style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                            >
                                {h}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map((t) => (
                        <TableRow
                            key={t.id}
                            className="cursor-pointer"
                            style={{ borderBottom: '1px solid #E2E8DF' }}
                            onClick={() => navigate(`/tickets/${t.id}`)}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#F2F5F0')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            <TableCell className="py-4 pl-4">
                                <p className="text-[14px] font-semibold" style={{ color: '#1A2E1A', fontFamily: 'Albert Sans, sans-serif' }}>
                                    {t.location}
                                </p>
                                <p className="text-[11px] mt-0.5" style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}>
                                    {CATEGORY_LABELS[t.category] ?? t.category}
                                </p>
                            </TableCell>
                            <TableCell className="py-4"><TicketPriorityBadge priority={t.priority} /></TableCell>
                            <TableCell className="py-4"><TicketStatusBadge status={t.status} /></TableCell>
                            <TableCell className="py-4">
                                <p className="font-mono text-[11px]" style={{ color: '#6B7B6B' }}>
                                    {format(new Date(t.createdAt), 'MMM dd, yyyy')}
                                </p>
                                <p className="font-mono text-[10px] mt-0.5" style={{ color: '#6B7B6B', opacity: 0.6 }}>
                                    {t.createdByName}
                                </p>
                            </TableCell>
                            <TableCell className="py-4">
                                <p
                                    className="text-[13px]"
                                    style={{
                                        color: t.assignedToName ? '#1A2E1A' : '#6B7B6B',
                                        fontStyle: t.assignedToName ? 'normal' : 'italic',
                                        fontFamily: 'Albert Sans, sans-serif',
                                    }}
                                >
                                    {t.assignedToName ?? 'Unassigned'}
                                </p>
                            </TableCell>
                            <TableCell className="py-4 pr-4 text-right">
                                <button
                                    className="text-[11px] font-semibold uppercase tracking-wider transition-colors"
                                    style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
                                    onClick={(e) => { e.stopPropagation(); navigate(`/tickets/${t.id}`); }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A2E1A')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#2D7A3A')}
                                >
                                    View →
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TicketListPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isDomainAdmin = user?.role === 'DOMAIN_ADMIN';
    const isAdmin = isSuperAdmin || isDomainAdmin;
    const isTechnician = user?.role === 'TECHNICIAN';

    // Only STUDENT and DOMAIN_ADMIN can create tickets
    const canCreate = user?.role === 'STUDENT' || user?.role === 'DOMAIN_ADMIN';

    // ── Tab layout per role ──────────────────────────────────────────────────
    //
    //  SUPER_ADMIN   →  "All Tickets" only
    //  DOMAIN_ADMIN  →  "My Tickets" + "Assigned Tickets" + "All Tickets"
    //  TECHNICIAN    →  "Assigned to Me" only
    //  STUDENT       →  "My Tickets" only
    //
    const getDefaultTab = () => {
        if (isSuperAdmin) return 'all';
        if (isDomainAdmin) return 'mine';   // lands on My Tickets first
        if (isTechnician) return 'assigned';
        return 'mine';
    };

    const [tab, setTab] = useState<string>('mine');

    useEffect(() => {
        setTab(getDefaultTab());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuperAdmin, isDomainAdmin, isTechnician]);

    // ── Data ─────────────────────────────────────────────────────────────────
    const { tickets: myTickets, isLoading: loadingMine } = useMyTickets();
    const { tickets: allTickets, isLoading: loadingAll } = useAllTickets();
    // For TECHNICIAN  → GET /api/tickets/assigned (assignedTo = current user)
    // For DOMAIN_ADMIN → derived client-side from allTickets (tickets that have any technician assigned)
    const { tickets: techAssignedTickets, isLoading: loadingTechAssigned } = useAssignedTickets();

    const adminAssignedTickets = useMemo(
        () => allTickets.filter((t) => t.assignedTo !== null && t.assignedToName !== null),
        [allTickets],
    );

    // Which dataset powers the "assigned" tab
    const assignedTickets = isDomainAdmin ? adminAssignedTickets : techAssignedTickets;
    const loadingAssigned = isDomainAdmin ? loadingAll : loadingTechAssigned;

    return (
        <div className="p-6 sm:p-8 max-w-[1400px] mx-auto page-enter">

            {/* Header */}
            <header className="mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <p
                            className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-2"
                            style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
                        >
                            Support
                        </p>
                        <div className="flex items-center gap-3 mb-1">
                            <TicketIcon size={22} style={{ color: '#7B6BA5' }} />
                            <h1
                                className="font-serif leading-tight"
                                style={{ color: '#1A2E1A', fontSize: 'clamp(26px, 3vw, 34px)' }}
                            >
                                Maintenance Tickets
                            </h1>
                        </div>
                        <p className="text-[14px] leading-relaxed" style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}>
                            Report and track facility incidents and technical issues across campus.
                        </p>
                    </div>

                    {canCreate && (
                        <button
                            onClick={() => navigate('/tickets/new')}
                            className="flex items-center gap-2 h-9 px-4 rounded-md text-[12px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
                            style={{ background: '#2D7A3A', color: '#FFFFFF', fontFamily: 'Albert Sans, sans-serif' }}
                        >
                            <Plus size={14} /> New Ticket
                        </button>
                    )}
                </div>
                <div className="mt-5 h-px" style={{ background: 'linear-gradient(90deg, #E2E8DF 0%, transparent 70%)' }} />
            </header>

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-6">

                    {/* My Tickets — STUDENT and DOMAIN_ADMIN */}
                    {!isSuperAdmin && !isTechnician && (
                        <TabsTrigger value="mine">My Tickets</TabsTrigger>
                    )}

                    {/* Assigned — TECHNICIAN ("Assigned to Me") and DOMAIN_ADMIN ("Assigned Tickets") */}
                    {(isTechnician || isDomainAdmin) && (
                        <TabsTrigger value="assigned">
                            {isTechnician ? 'Assigned to Me' : 'Assigned Tickets'}
                        </TabsTrigger>
                    )}

                    {/* All Tickets — SUPER_ADMIN and DOMAIN_ADMIN */}
                    {isAdmin && (
                        <TabsTrigger value="all">All Tickets</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="mine">
                    <TicketTable tickets={myTickets} isLoading={loadingMine} />
                </TabsContent>

                <TabsContent value="assigned">
                    <TicketTable tickets={assignedTickets} isLoading={loadingAssigned} />
                </TabsContent>

                <TabsContent value="all">
                    <TicketTable tickets={allTickets} isLoading={loadingAll} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TicketListPage;