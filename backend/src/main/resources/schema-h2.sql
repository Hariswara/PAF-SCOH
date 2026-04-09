-- Smart Campus Operations Hub — DDL (H2)

-- Domains Table
CREATE TABLE IF NOT EXISTS domains (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    department VARCHAR(255),
    phone VARCHAR(20),
    contact_email VARCHAR(255),
    gender VARCHAR(20),
    profile_picture TEXT,
    role VARCHAR(50), -- STUDENT, DOMAIN_ADMIN, TECHNICIAN, SUPER_ADMIN
    status VARCHAR(50) DEFAULT 'PENDING_PROFILE', -- PENDING_PROFILE, PENDING_ACTIVATION, ACTIVE, SUSPENDED
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Passkey Credentials Table
CREATE TABLE IF NOT EXISTS passkey_credentials (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id BINARY(512) NOT NULL UNIQUE,
    credential_id_base64 VARCHAR(512) NOT NULL UNIQUE,
    public_key_cose BINARY(2048) NOT NULL,
    signature_count BIGINT NOT NULL DEFAULT 0,
    display_name VARCHAR(255),
    aaguid UUID,
    transports VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

-- WebAuthn Challenge Nonces Table
CREATE TABLE IF NOT EXISTS webauthn_challenges (
    challenge_id UUID DEFAULT random_uuid() PRIMARY KEY,
    challenge VARCHAR(512) NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_type VARCHAR(20) NOT NULL,
    request_json CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- User Role Audit Table
CREATE TABLE IF NOT EXISTS user_role_audit (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES users(id),
    old_role VARCHAR(50),
    new_role VARCHAR(50),
    old_domain_id UUID REFERENCES domains(id),
    new_domain_id UUID REFERENCES domains(id),
    reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id                    UUID DEFAULT random_uuid() PRIMARY KEY,
    created_by            UUID NOT NULL,
    domain_id             UUID,
    resource_id           VARCHAR(255),
    location              VARCHAR(255) NOT NULL,
    category              VARCHAR(50)  NOT NULL,
    description           TEXT         NOT NULL,
    priority              VARCHAR(20)  NOT NULL,
    preferred_contact     VARCHAR(255) NOT NULL,
    status                VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    rejection_reason      TEXT,
    assigned_to           UUID,
    resolution_notes      TEXT,
    linked_ticket_id      UUID,
    linked_reporters_count INT NOT NULL DEFAULT 0,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_attachments (
    id           UUID DEFAULT random_uuid() PRIMARY KEY,
    ticket_id    UUID NOT NULL,
    uploaded_by  UUID NOT NULL,
    filename     VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    storage_path TEXT         NOT NULL,
    public_url   TEXT         NOT NULL,
    file_size    BIGINT       NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_comments (
    id         UUID DEFAULT random_uuid() PRIMARY KEY,
    ticket_id  UUID NOT NULL,
    author_id  UUID NOT NULL,
    body       TEXT NOT NULL,
    edited     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
