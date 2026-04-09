import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';
import type { DuplicateSuggestion, TicketStatus } from '@/types/ticket';

interface Props {
    suggestions: DuplicateSuggestion[];
    onLink: (ticketId: string) => void;
    linkedId?: string;
}

export const DuplicateSidebar: React.FC<Props> = ({ suggestions, onLink, linkedId }) => {
    return (
        <div className="sticky top-6 space-y-4">
            <div className="flex items-center gap-2">
                <AlertTriangleIcon className="size-4 text-yellow-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Similar Open Tickets
                </h3>
            </div>

            {suggestions.length === 0 ? (
                <div className="bg-card border border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground font-light italic">
                        No similar tickets found. Type a description to check.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {suggestions.map((s) => (
                        <div
                            key={s.ticketId}
                            className={`bg-card border p-4 transition-all ${linkedId === s.ticketId
                                ? 'border-yellow-400 bg-yellow-50/50'
                                : 'border-border hover:border-secondary'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-xs font-bold text-primary truncate max-w-[130px]">{s.location}</p>
                                <TicketStatusBadge status={s.status as TicketStatus} />
                            </div>
                            <p className="text-xs text-muted-foreground font-light line-clamp-2 mb-3">
                                {s.descriptionSnippet}
                            </p>
                            <div className="flex gap-2">
                                {linkedId === s.ticketId ? (
                                    <Button size="xs" variant="outline" className="flex-1 border-yellow-400 text-yellow-700" disabled>
                                        <LinkIcon className="size-3" /> Linked
                                    </Button>
                                ) : (
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => onLink(s.ticketId)}
                                    >
                                        <LinkIcon className="size-3" /> Link Report
                                    </Button>
                                )}
                                <Link
                                    to={`/tickets/${s.ticketId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center hover:underline"
                                >
                                    View →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-[10px] text-muted-foreground leading-relaxed">
                Linking your report to an existing ticket helps the team understand the full scope of impact without creating duplicates.
            </p>
        </div>
    );
};