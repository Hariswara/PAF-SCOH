import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMyTickets, useAllTickets, useAssignedTickets } from '@/hooks/useTickets';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { TicketPriorityBadge } from '@/components/tickets/TicketPriorityBadge';
import { format } from 'date-fns';
import { PlusIcon, TicketIcon } from 'lucide-react';
import type { TicketResponse } from '@/types/ticket';

const CATEGORY_LABELS: Record<string, string> = {
    ELECTRICAL: 'Electrical',
    PLUMBING: 'Plumbing',
    HVAC: 'HVAC',
    EQUIPMENT: 'Equipment',
    NETWORK: 'Network',
    OTHER: 'Other',
};

function TicketTable({ tickets, isLoading }: { tickets: TicketResponse[]; isLoading: boolean }) {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div className="py-20 text-center text-muted-foreground font-light italic">
                No tickets found.
            </div>
        );
    }

    return (
        <div className="bg-card border border-border shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 border-b border-border">
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4 pl-6">Location / Category</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Priority</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Status</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Reported</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4">Assigned To</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-primary py-4 text-right pr-6">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                    {tickets.map((t) => (
                        <TableRow
                            key={t.id}
                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => navigate(`/tickets/${t.id}`)}
                        >
                            <TableCell className="py-5 pl-6">
                                <p className="font-serif text-base font-bold text-primary">{t.location}</p>
                                <p className="text-xs text-muted-foreground font-light">{CATEGORY_LABELS[t.category] ?? t.category}</p>
                            </TableCell>
                            <TableCell className="py-5">
                                <TicketPriorityBadge priority={t.priority} />
                            </TableCell>
                            <TableCell className="py-5">
                                <TicketStatusBadge status={t.status} />
                            </TableCell>
                            <TableCell className="py-5">
                                <p className="text-xs font-mono text-muted-foreground">
                                    {format(new Date(t.createdAt), 'MMM dd, yyyy')}
                                </p>
                                <p className="text-[10px] font-mono text-muted-foreground/60">
                                    {t.createdByName}
                                </p>
                            </TableCell>
                            <TableCell className="py-5">
                                <p className="text-sm text-muted-foreground">
                                    {t.assignedToName ?? <span className="italic opacity-40">Unassigned</span>}
                                </p>
                            </TableCell>
                            <TableCell className="py-5 text-right pr-6">
                                <button
                                    className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/tickets/${t.id}`); }}
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

const TicketListPage: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'DOMAIN_ADMIN';
    const isTechnician = user?.role === 'TECHNICIAN';

    const defaultTab = isAdmin ? 'all' : isTechnician ? 'assigned' : 'mine';
    const [tab, setTab] = useState(defaultTab);

    const { tickets: myTickets, isLoading: loadingMine } = useMyTickets();
    const { tickets: allTickets, isLoading: loadingAll } = useAllTickets();
    const { tickets: assignedTickets, isLoading: loadingAssigned } = useAssignedTickets();

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
            <header className="bg-primary text-primary-foreground py-8 px-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <Link
                        to="/dashboard"
                        className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-white transition-colors flex items-center mb-4"
                    >
                        <span className="mr-2">←</span> Return to Dashboard
                    </Link>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-serif mb-2">Maintenance Tickets</h1>
                            <p className="text-primary-foreground/70 font-light max-w-xl text-sm">
                                Report and track facility incidents and technical issues across campus.
                            </p>
                        </div>
                        <Link to="/tickets/new">
                            <Button className="h-10 bg-secondary text-white hover:bg-secondary/80 font-bold tracking-widest uppercase text-xs flex items-center gap-2">
                                <PlusIcon className="size-4" /> New Ticket
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8">
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="mb-6">
                        {(isAdmin || !isTechnician) && (
                            <TabsTrigger value="mine">
                                <TicketIcon className="size-4" /> My Tickets
                            </TabsTrigger>
                        )}
                        {isTechnician && (
                            <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
                        )}
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
            </main>
        </div>
    );
};

export default TicketListPage;