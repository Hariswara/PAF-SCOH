package com.smartcampus.dto;

import com.smartcampus.model.ResourceStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateResourceStatusRequest(
        @NotNull(message = "Status is required") ResourceStatus status) {
}