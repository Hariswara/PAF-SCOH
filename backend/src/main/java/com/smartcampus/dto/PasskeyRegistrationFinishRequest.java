package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record PasskeyRegistrationFinishRequest(
        @NotBlank String credentialJson
) {
}
