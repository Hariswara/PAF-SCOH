package com.smartcampus.dto;

import com.smartcampus.model.ResourceType;
import jakarta.validation.constraints.*;

public record UpdateResourceRequest(

        @NotNull(message = "Resource type is required") ResourceType resourceType,

        @NotBlank(message = "Name is required") @Size(min = 2, max = 255) String name,

        @Size(max = 1000) String description,

        @NotBlank(message = "Location is required") @Size(max = 255) String location,

        @Min(0) Integer capacity,

        String metadata) {
}