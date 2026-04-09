import { Badge } from '@/components/ui/badge';
import type { TicketStatus } from '@/types/ticket';

const config: Record<TicketStatus, { label: string; className: string }> = {
    OPEN: { label: 'Open', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    RESOLVED: { label: 'Resolved', className: 'bg-green-50 text-green-700 border-green-200' },
    CLOSED: { label: 'Closed', className: 'bg-muted text-muted-foreground border-border' },
    REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
    const { label, className } = config[status];
    return (
        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest border ${className}`}>
            {label}
        </Badge>
    );
}