package com.smartcampus.dto;

import com.smartcampus.model.TicketCategory;
import com.smartcampus.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTicketRequest(

        // resourceId is optional (placeholder until Module A is ready)
        String resourceId,

        @NotBlank(message = "Location is required") @Size(max = 255, message = "Location must be under 255 characters") String location,

        @NotNull(message = "Category is required") TicketCategory category,

        @NotBlank(message = "Description is required") @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters") String description,

        @NotNull(message = "Priority is required") TicketPriority priority,

        @NotBlank(message = "Preferred contact is required") @Size(max = 255, message = "Preferred contact must be under 255 characters") String preferredContact,

        // link to an existing ticket instead of creating a new one
        java.util.UUID linkedTicketId) {
}
