package com.smartcampus.dto;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ResourceResponseDTO {
    private UUID id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String availabilityWindows;
    private ResourceStatus status;
    private String description;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}