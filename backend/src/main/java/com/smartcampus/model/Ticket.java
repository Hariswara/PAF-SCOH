package com.smartcampus.model;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

@Table("tickets")
public record Ticket(
        @Id UUID id,
        UUID createdBy,
        UUID domainId,
        String resourceId, // placeholder – connect when Module A ready
        String location,
        TicketCategory category,
        String description,
        TicketPriority priority,
        String preferredContact,
        TicketStatus status,
        String rejectionReason,
        UUID assignedTo,
        String resolutionNotes,
        UUID linkedTicketId,
        int linkedReportersCount,
        @CreatedDate Instant createdAt,
        @LastModifiedDate Instant updatedAt) {
}
