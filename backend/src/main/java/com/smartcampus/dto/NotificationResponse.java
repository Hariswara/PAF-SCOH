package com.smartcampus.dto;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
    UUID id,
    String type,
    String title,
    String message,
    String referenceId,
    String referenceType,
    boolean isRead,
    Instant createdAt
) {}
