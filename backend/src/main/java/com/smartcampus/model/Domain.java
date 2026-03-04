package com.smartcampus.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("domains")
public record Domain(
    @Id UUID id,
    String name,
    String description,
    boolean isActive,
    UUID createdBy,
    @CreatedDate Instant createdAt,
    @LastModifiedDate Instant updatedAt
) {
}
