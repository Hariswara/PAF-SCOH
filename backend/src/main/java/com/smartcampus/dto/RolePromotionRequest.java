package com.smartcampus.dto;

import com.smartcampus.model.UserRole;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RolePromotionRequest(
    @NotNull(message = "New role is required")
    UserRole newRole,

    UUID domainId,

    String reason
) {}
