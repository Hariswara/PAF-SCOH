import { Badge } from '@/components/ui/badge';
import type { TicketPriority } from '@/types/ticket';

const config: Record<TicketPriority, { label: string; className: string }> = {
    LOW: { label: 'Low', className: 'bg-muted text-muted-foreground border-border' },
    MEDIUM: { label: 'Medium', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    HIGH: { label: 'High', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    CRITICAL: { label: 'Critical', className: 'bg-red-50 text-red-700 border-red-200' },
};

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
    const { label, className } = config[priority];
    return (
        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest border ${className}`}>
            {label}
        </Badge>
    );
}