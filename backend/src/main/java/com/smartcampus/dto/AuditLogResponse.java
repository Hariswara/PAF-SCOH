package com.smartcampus.dto;

import com.smartcampus.model.UserRole;
import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
    UUID id,
    UUID userId,
    String userName,
    String userEmail,
    UUID changedBy,
    String changedByName,
    UserRole oldRole,
    UserRole newRole,
    UUID oldDomainId,
    String oldDomainName,
    UUID newDomainId,
    String newDomainName,
    String reason,
    Instant changedAt
) {}
