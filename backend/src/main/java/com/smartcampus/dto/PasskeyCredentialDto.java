package com.smartcampus.dto;

import com.smartcampus.model.PasskeyCredential;

import java.time.Instant;
import java.util.UUID;

public record PasskeyCredentialDto(
        UUID id,
        String displayName,
        Instant createdAt,
        Instant lastUsedAt,
        String transports
) {
    public static PasskeyCredentialDto from(PasskeyCredential credential) {
        return new PasskeyCredentialDto(
                credential.id(),
                credential.displayName(),
                credential.createdAt(),
                credential.lastUsedAt(),
                credential.transports()
        );
    }
}
