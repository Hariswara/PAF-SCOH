package com.smartcampus.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("notifications")
public record Notification(
    @Id UUID id,
    UUID userId,
    String type,
    String title,
    String message,
    String referenceId,
    String referenceType,
    boolean isRead,
    @CreatedDate Instant createdAt
) {
    public Notification withRead(boolean read) {
        return new Notification(id, userId, type, title, message, referenceId, referenceType, read, createdAt);
    }
}
