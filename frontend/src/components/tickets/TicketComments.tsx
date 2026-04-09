import React, { useEffect, useState } from 'react';
import { ticketApi } from '@/lib/ticketApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from 'lucide-react';
import type { CommentResponse } from '@/types/ticket';

interface Props {
    ticketId: string;
    currentUserId: string;
}

export const TicketComments: React.FC<Props> = ({ ticketId, currentUserId }) => {
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newBody, setNewBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inline edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editBody, setEditBody] = useState('');

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await ticketApi.getComments(ticketId);
            setComments(data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { load(); }, [ticketId]);

    const handleAdd = async () => {
        if (!newBody.trim()) return;
        setIsSubmitting(true);
        try {
            await ticketApi.addComment(ticketId, newBody.trim());
            setNewBody('');
            load();
        } catch { toast.error('Failed to post comment.'); }
        finally { setIsSubmitting(false); }
    };

    const handleEdit = async (commentId: string) => {
        if (!editBody.trim()) return;
        try {
            await ticketApi.editComment(ticketId, commentId, editBody.trim());
            setEditingId(null);
            load();
        } catch { toast.error('Failed to update comment.'); }
    };

    const handleDelete = async (commentId: string) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await ticketApi.deleteComment(ticketId, commentId);
            load();
        } catch { toast.error('Failed to delete comment.'); }
    };

    const startEdit = (c: CommentResponse) => {
        setEditingId(c.id);
        setEditBody(c.body);
    };

    return (
        <section className="bg-card border border-border p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6 border-b border-border pb-3">
                Comments ({comments.length})
            </h2>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-4 border-secondary border-t-primary rounded-full animate-spin" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground font-light italic text-center py-8">
                    No comments yet. Be the first to add one.
                </p>
            ) : (
                <div className="space-y-0 divide-y divide-border mb-6">
                    {comments.map((c) => (
                        <div key={c.id} className="py-5 group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-sm font-bold text-primary">{c.authorName}</span>
                                    {c.edited && (
                                        <span className="ml-2 text-[10px] text-muted-foreground italic">(edited)</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        {format(new Date(c.createdAt), 'MMM dd, HH:mm')}
                                    </span>
                                    {c.authorId === currentUserId && editingId !== c.id && (
                                        <>
                                            <button
                                                onClick={() => startEdit(c)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                                            >
                                                <PencilIcon className="size-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                            >
                                                <TrashIcon className="size-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {editingId === c.id ? (
                                <div className="space-y-2">
                                    <Textarea
                                        value={editBody}
                                        onChange={(e) => setEditBody(e.target.value)}
                                        rows={3}
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <Button size="xs" onClick={() => handleEdit(c.id)} disabled={!editBody.trim()}>
                                            <CheckIcon className="size-3" /> Save
                                        </Button>
                                        <Button size="xs" variant="ghost" onClick={() => setEditingId(null)}>
                                            <XIcon className="size-3" /> Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-foreground font-light whitespace-pre-wrap leading-relaxed">
                                    {c.body}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* New comment form */}
            <div className="space-y-3 border-t border-border pt-5">
                <Textarea
                    placeholder="Add a comment..."
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    rows={3}
                />
                <Button
                    size="sm"
                    disabled={isSubmitting || !newBody.trim()}
                    onClick={handleAdd}
                    className="uppercase tracking-widest text-xs font-bold"
                >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
            </div>
        </section>
    );
};