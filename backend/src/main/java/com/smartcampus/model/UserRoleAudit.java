package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("user_role_audit")
public record UserRoleAudit(
    @Id UUID id,
    UUID userId,
    UUID changedBy,
    UserRole oldRole,
    UserRole newRole,
    UUID oldDomainId,
    UUID newDomainId,
    String reason,
    Instant changedAt
) {
}
