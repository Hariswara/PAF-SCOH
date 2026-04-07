package com.smartcampus.dto;

import java.time.Instant;
import java.util.UUID;

public record AttachmentResponse(
        UUID id,
        UUID ticketId,
        String filename,
        String contentType,
        String publicUrl,
        long fileSize,
        Instant createdAt) {
}
