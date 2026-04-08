export type TicketCategory =
    | 'ELECTRICAL'
    | 'PLUMBING'
    | 'HVAC'
    | 'EQUIPMENT'
    | 'NETWORK'
    | 'OTHER';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus =
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'RESOLVED'
    | 'CLOSED'
    | 'REJECTED';

export interface AttachmentResponse {
    id: string;
    ticketId: string;
    filename: string;
    contentType: string;
    publicUrl: string;
    fileSize: number;
    createdAt: string;
}

export interface TicketResponse {
    id: string;
    createdBy: string;
    createdByName: string;
    domainId: string | null;
    resourceId: string | null;
    location: string;
    category: TicketCategory;
    description: string;
    priority: TicketPriority;
    preferredContact: string;
    status: TicketStatus;
    rejectionReason: string | null;
    assignedTo: string | null;
    assignedToName: string | null;
    resolutionNotes: string | null;
    linkedTicketId: string | null;
    linkedReportersCount: number;
    attachments: AttachmentResponse[];
    commentCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTicketRequest {
    resourceId?: string;
    location: string;
    category: TicketCategory;
    description: string;
    priority: TicketPriority;
    preferredContact: string;
    linkedTicketId?: string;
}

export interface DuplicateSuggestion {
    ticketId: string;
    location: string;
    descriptionSnippet: string;
    status: string;
    relevanceScore: number;
}

export interface CommentResponse {
    id: string;
    ticketId: string;
    authorId: string;
    authorName: string;
    body: string;
    edited: boolean;
    createdAt: string;
    updatedAt: string;
}