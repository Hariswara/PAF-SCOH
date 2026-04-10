package com.smartcampus.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("resources")
public record Resource(
        @Id UUID id,
        UUID domainId,
        String resourceType, // stored as VARCHAR — use ResourceType.valueOf() to convert
        String name,
        String description,
        String location,
        Integer capacity,
        String status, // stored as VARCHAR — use ResourceStatus.valueOf() to convert
        String metadata,
        UUID createdBy,
        @CreatedDate Instant createdAt,
        @LastModifiedDate Instant updatedAt) {
    /**
     * Convenience accessor — never throws if DB value is always written via
     * ResourceStatus.name()
     */
    public ResourceStatus statusEnum() {
        return ResourceStatus.valueOf(this.status);
    }

    public ResourceType resourceTypeEnum() {
        return ResourceType.valueOf(this.resourceType);
    }
}