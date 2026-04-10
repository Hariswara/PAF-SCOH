package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, columnDefinition = "VARCHAR(255)")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    private Integer capacity;

    @Column(nullable = false, columnDefinition = "VARCHAR(255)")
    private String location;

    @Column(columnDefinition = "VARCHAR(255)")
    private String availabilityWindows;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "domain_id")
    private UUID domainId;

    @CreationTimestamp
    @Column(updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
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