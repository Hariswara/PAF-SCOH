import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, LinkIcon } from 'lucide-react';
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
                <AlertTriangle size={14} style={{ color: '#D97706' }} />
                <h3
                    className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                >
                    Similar Open Tickets
                </h3>
            </div>

            {suggestions.length === 0 ? (
                <div
                    className="p-6 text-center rounded-md"
                    style={{ border: '1px dashed #E2E8DF' }}
                >
                    <p
                        className="text-[13px] italic"
                        style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                    >
                        No similar tickets found.<br />Type a description to check.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {suggestions.map((s) => {
                        const isLinked = linkedId === s.ticketId;
                        return (
                            <div
                                key={s.ticketId}
                                className="rounded-md p-4 transition-colors"
                                style={{
                                    background: isLinked ? 'rgba(234,179,8,0.05)' : '#FFFFFF',
                                    border: `1px solid ${isLinked ? '#FDE68A' : '#E2E8DF'}`,
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <p
                                        className="text-[13px] font-semibold truncate max-w-[130px]"
                                        style={{ color: '#1A2E1A', fontFamily: 'Albert Sans, sans-serif' }}
                                    >
                                        {s.location}
                                    </p>
                                    <TicketStatusBadge status={s.status as TicketStatus} />
                                </div>

                                <p
                                    className="text-[12px] line-clamp-2 mb-3 leading-relaxed"
                                    style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                                >
                                    {s.descriptionSnippet}
                                </p>

                                <div className="flex gap-2 items-center">
                                    {isLinked ? (
                                        <span
                                            className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-md"
                                            style={{ background: 'rgba(234,179,8,0.12)', color: '#92400E', border: '1px solid #FDE68A' }}
                                        >
                                            <LinkIcon size={10} /> Linked
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => onLink(s.ticketId)}
                                            className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors"
                                            style={{
                                                background: 'rgba(45,122,58,0.06)',
                                                color: '#2D7A3A',
                                                border: '1px solid rgba(45,122,58,0.2)',
                                                fontFamily: 'Albert Sans, sans-serif',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(45,122,58,0.12)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(45,122,58,0.06)')}
                                        >
                                            <LinkIcon size={10} /> Link Report
                                        </button>
                                    )}

                                    {/* View opens in same tab; TicketDetailPage will hide sensitive fields */}
                                    <Link
                                        to={`/tickets/${s.ticketId}`}
                                        className="text-[11px] font-semibold uppercase tracking-wider transition-colors"
                                        style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#2D7A3A')}
                                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#6B7B6B')}
                                    >
                                        View →
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <p
                className="text-[11px] leading-relaxed"
                style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
            >
                Linking your report to an existing ticket helps the team understand the full scope of impact without creating duplicates.
            </p>
        </div>
    );
};