package com.smartcampus.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("passkey_credentials")
public record PasskeyCredential(
        @Id UUID id,
        UUID userId,
        byte[] credentialId,
        String credentialIdBase64,
        byte[] publicKeyCose,
        long signatureCount,
        String displayName,
        UUID aaguid,
        String transports,        // JSON array string e.g. '["internal","hybrid"]'
        @CreatedDate Instant createdAt,
        Instant lastUsedAt
) {
    public static PasskeyCredential createNew(
            UUID userId,
            byte[] credentialId,
            String credentialIdBase64,
            byte[] publicKeyCose,
            long signatureCount,
            String displayName,
            UUID aaguid,
            String transports
    ) {
        return new PasskeyCredential(
                null, userId, credentialId, credentialIdBase64,
                publicKeyCose, signatureCount, displayName, aaguid, transports,
                null, null
        );
    }
}
