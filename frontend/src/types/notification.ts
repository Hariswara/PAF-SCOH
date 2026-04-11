export type NotificationType =
    | 'TICKET_CREATED'
    | 'TICKET_ASSIGNED'
    | 'TICKET_STATUS_CHANGED'
    | 'TICKET_COMMENT_ADDED'
    | 'BOOKING_CREATED'
    | 'BOOKING_APPROVED'
    | 'BOOKING_REJECTED'
    | 'BOOKING_CANCELLED'
    | 'USER_REGISTERED'
    | 'USER_ACTIVATED'
    | 'USER_ROLE_CHANGED'
    | 'USER_SUSPENDED';

export type ReferenceType = 'TICKET' | 'BOOKING' | 'USER';

export interface NotificationResponse {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    referenceId: string | null;
    referenceType: ReferenceType | null;
    isRead: boolean;
    createdAt: string;
}
