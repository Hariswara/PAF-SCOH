package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(
        @NotBlank(message = "Comment body is required") @Size(min = 1, max = 1000, message = "Comment must be between 1 and 1000 characters") String body) {
}