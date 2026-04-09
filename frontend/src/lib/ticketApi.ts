import api from '@/lib/api';
import type {
    TicketResponse,
    CreateTicketRequest,
    DuplicateSuggestion,
    CommentResponse,
    TicketStatus,
} from '@/types/ticket';

// ── Tickets ──────────────────────────────────────────────────────────

export const ticketApi = {
    getAll: () =>
        api.get<TicketResponse[]>('/tickets').then((r) => r.data),

    getMine: () =>
        api.get<TicketResponse[]>('/tickets/mine').then((r) => r.data),

    getAssigned: () =>
        api.get<TicketResponse[]>('/tickets/assigned').then((r) => r.data),

    getById: (id: string) =>
        api.get<TicketResponse>(`/tickets/${id}`).then((r) => r.data),

    create: (data: CreateTicketRequest) =>
        api.post<TicketResponse>('/tickets', data).then((r) => r.data),

    updateStatus: (id: string, status: TicketStatus, rejectionReason?: string) =>
        api
            .patch<TicketResponse>(`/tickets/${id}/status`, { status, rejectionReason })
            .then((r) => r.data),

    assign: (id: string, technicianId: string) =>
        api
            .patch<TicketResponse>(`/tickets/${id}/assign`, { technicianId })
            .then((r) => r.data),

    addResolution: (id: string, resolutionNotes: string) =>
        api
            .patch<TicketResponse>(`/tickets/${id}/resolution`, { resolutionNotes })
            .then((r) => r.data),

    // ── Attachments ──────────────────────────────────────────────────

    uploadAttachment: (ticketId: string, file: File) => {
        const form = new FormData();
        form.append('file', file);
        return api
            .post<{ id: string; publicUrl: string; filename: string }>(
                `/tickets/${ticketId}/attachments`,
                form,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            .then((r) => r.data);
    },

    deleteAttachment: (ticketId: string, attachmentId: string) =>
        api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`),

    // ── Comments ─────────────────────────────────────────────────────

    getComments: (ticketId: string) =>
        api.get<CommentResponse[]>(`/tickets/${ticketId}/comments`).then((r) => r.data),

    addComment: (ticketId: string, body: string) =>
        api
            .post<CommentResponse>(`/tickets/${ticketId}/comments`, { body })
            .then((r) => r.data),

    editComment: (ticketId: string, commentId: string, body: string) =>
        api
            .put<CommentResponse>(`/tickets/${ticketId}/comments/${commentId}`, { body })
            .then((r) => r.data),

    deleteComment: (ticketId: string, commentId: string) =>
        api.delete(`/tickets/${ticketId}/comments/${commentId}`),

    // ── Duplicate detection ───────────────────────────────────────────

    checkDuplicates: (description: string, excludeTicketId?: string) =>
        api
            .get<DuplicateSuggestion[]>('/tickets/duplicates/check', {
                params: { description, excludeTicketId },
            })
            .then((r) => r.data),
};