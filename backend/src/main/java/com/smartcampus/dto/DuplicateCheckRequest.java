package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record DuplicateCheckRequest(
        @NotBlank(message = "Description is required for duplicate check") String description,

        String excludeTicketId // optional
) {
}
