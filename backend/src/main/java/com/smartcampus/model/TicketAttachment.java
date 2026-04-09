package com.smartcampus.model;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("ticket_attachments")
public record TicketAttachment(
        @Id UUID id,
        UUID ticketId,
        UUID uploadedBy,
        String filename,
        String contentType,
        String storagePath, // Cloudinary public_id
        String publicUrl, // Cloudinary secure URL
        long fileSize,
        @CreatedDate Instant createdAt) {
}
