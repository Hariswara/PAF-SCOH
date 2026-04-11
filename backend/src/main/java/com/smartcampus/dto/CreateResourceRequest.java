package com.smartcampus.dto;

import com.smartcampus.model.ResourceType;
import jakarta.validation.constraints.*;
import java.util.UUID;

public record CreateResourceRequest(

        @NotNull(message = "Domain ID is required") UUID domainId,

        @NotNull(message = "Resource type is required") ResourceType resourceType,

        @NotBlank(message = "Name is required") @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters") String name,

        @Size(max = 1000, message = "Description must be under 1000 characters") String description,

        @NotBlank(message = "Location is required") @Size(max = 255, message = "Location must be under 255 characters") String location,

        @Min(value = 0, message = "Capacity cannot be negative") Integer capacity, // nullable – omit for equipment

        String metadata // optional JSON string
) {
}