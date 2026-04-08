package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record ResolutionNotesRequest(
        @NotBlank(message = "Resolution notes cannot be blank") String resolutionNotes) {
}
