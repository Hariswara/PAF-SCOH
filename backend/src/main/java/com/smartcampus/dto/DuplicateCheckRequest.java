package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record DuplicateCheckRequest(

                @NotBlank(message = "Description is required for duplicate check") String description,

                /** boosts matches at the same location. */
                String location,

                /** filters/boosts results within the same domain. */
                String domainId,

                /** Ticket ID to exclude from results (used when editing). */
                String excludeTicketId) {
}
