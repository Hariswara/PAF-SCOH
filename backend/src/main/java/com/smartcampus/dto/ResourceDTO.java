package com.smartcampus.resource;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.UUID;

@Data
public class ResourceDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String availabilityWindows;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private String description;

    private UUID domainId;
}