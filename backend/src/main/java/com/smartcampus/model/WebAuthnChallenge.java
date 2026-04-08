package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("webauthn_challenges")
public record WebAuthnChallenge(
        @Id UUID challengeId,
        String challenge,
        UUID userId,            // null for authentication challenges (discoverable flow)
        String challengeType,  // "REGISTRATION" or "AUTHENTICATION"
        String requestJson,     // serialized PublicKeyCredentialCreationOptions (registration only)
        Instant createdAt,
        Instant expiresAt
) {
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}
