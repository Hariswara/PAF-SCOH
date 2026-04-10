package com.smartcampus.dto;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import java.time.Instant;
import java.util.UUID;

public record ResourceResponse(
        UUID id,
        UUID domainId,
        String domainName, // resolved for convenience – avoids extra frontend call
        ResourceType resourceType,
        String name,
        String description,
        String location,
        Integer capacity,
        ResourceStatus status,
        String metadata,
        UUID createdBy,
        Instant createdAt,
        Instant updatedAt) {
}