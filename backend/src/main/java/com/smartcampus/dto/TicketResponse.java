package com.smartcampus.dto;

import com.smartcampus.model.TicketCategory;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        UUID createdBy,
        String createdByName,
        UUID domainId,
        String resourceId,
        String location,
        TicketCategory category,
        String description,
        TicketPriority priority,
        String preferredContact,
        TicketStatus status,
        String rejectionReason,
        UUID assignedTo,
        String assignedToName,
        String resolutionNotes,
        UUID linkedTicketId,
        int linkedReportersCount,
        List<AttachmentResponse> attachments,
        long commentCount,
        Instant createdAt,
        Instant updatedAt) {
}
