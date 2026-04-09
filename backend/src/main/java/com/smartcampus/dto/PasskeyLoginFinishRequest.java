package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record PasskeyLoginFinishRequest(
        @NotBlank String credentialJson
) {
}
