package com.smartcampus.event;

import java.util.UUID;

public sealed interface TicketEvent {

    UUID ticketId();

    record Created(UUID ticketId, UUID createdBy, UUID domainId, String location,
                   String category, String priority) implements TicketEvent {}

    record Assigned(UUID ticketId, UUID assignedTo, UUID assignedBy,
                    String ticketLocation) implements TicketEvent {}

    record StatusChanged(UUID ticketId, UUID createdBy, String oldStatus,
                         String newStatus, String ticketLocation) implements TicketEvent {}

    record CommentAdded(UUID ticketId, UUID ticketCreatedBy, UUID assignedTo,
                        UUID commentAuthorId, String authorName,
                        String ticketLocation) implements TicketEvent {}
}
