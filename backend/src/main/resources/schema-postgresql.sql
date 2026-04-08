-- Smart Campus Operations Hub — DDL (PostgreSQL)

-- Domains Table
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    department VARCHAR(255),
    phone VARCHAR(20),
    profile_picture TEXT,
    role VARCHAR(50), -- STUDENT, DOMAIN_ADMIN, TECHNICIAN, SUPER_ADMIN
    status VARCHAR(50) DEFAULT 'PENDING_PROFILE', -- PENDING_PROFILE, PENDING_ACTIVATION, ACTIVE, SUSPENDED
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Passkey Credentials Table
CREATE TABLE IF NOT EXISTS passkey_credentials (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id        BYTEA NOT NULL UNIQUE,
    credential_id_base64 TEXT NOT NULL UNIQUE,
    public_key_cose      BYTEA NOT NULL,
    signature_count      BIGINT NOT NULL DEFAULT 0,
    display_name         VARCHAR(255),
    aaguid               UUID,
    transports           VARCHAR(500),
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at         TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_passkey_cred_user ON passkey_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_passkey_cred_id   ON passkey_credentials(credential_id_base64);

-- WebAuthn Challenge Nonces Table
CREATE TABLE IF NOT EXISTS webauthn_challenges (
    challenge_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge      TEXT NOT NULL UNIQUE,
    user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_type VARCHAR(20) NOT NULL,
    request_json   TEXT,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at     TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_webauthn_challenge     ON webauthn_challenges(challenge);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenge_exp ON webauthn_challenges(expires_at);

-- User Role Audit Table
CREATE TABLE IF NOT EXISTS user_role_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES users(id),
    old_role VARCHAR(50),
    new_role VARCHAR(50),
    old_domain_id UUID REFERENCES domains(id),
    new_domain_id UUID REFERENCES domains(id),
    reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
