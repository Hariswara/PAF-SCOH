package com.smartcampus.dto;

import java.time.Instant;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        UUID ticketId,
        UUID authorId,
        String authorName,
        String body,
        boolean edited,
        Instant createdAt,
        Instant updatedAt) {
}
