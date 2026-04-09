-- V2: Passkey (WebAuthn) support
-- Run this ONCE manually against your Neon PostgreSQL database.

-- 1. Relax google_id NOT NULL constraint
--    PostgreSQL treats multiple NULLs as distinct under UNIQUE, so this is safe.
ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;

-- 2. Passkey credentials table
CREATE TABLE IF NOT EXISTS passkey_credentials (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id        BYTEA NOT NULL UNIQUE,
    credential_id_base64 TEXT NOT NULL UNIQUE,
    public_key_cose      BYTEA NOT NULL,
    signature_count      BIGINT NOT NULL DEFAULT 0,
    display_name         VARCHAR(255),
    aaguid               UUID,
    transports           VARCHAR(500),   -- JSON array string, e.g. '["internal","hybrid"]'
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at         TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_passkey_cred_user ON passkey_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_passkey_cred_id   ON passkey_credentials(credential_id_base64);

-- 3. WebAuthn challenge nonces (short-lived, 60s TTL enforced in application layer)
CREATE TABLE IF NOT EXISTS webauthn_challenges (
    challenge_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge      TEXT NOT NULL UNIQUE,
    user_id        UUID REFERENCES users(id) ON DELETE CASCADE,  -- NULL for authentication challenges
    challenge_type VARCHAR(20) NOT NULL,  -- 'REGISTRATION' or 'AUTHENTICATION'
    request_json   TEXT,                 -- serialized PublicKeyCredentialCreationOptions (registration only)
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at     TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_webauthn_challenge     ON webauthn_challenges(challenge);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenge_exp ON webauthn_challenges(expires_at);
