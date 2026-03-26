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
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    department VARCHAR(255),
    phone VARCHAR(20),
    profile_picture TEXT,
    role VARCHAR(50), -- STUDENT, DOMAIN_ADMIN, TECHNICIAN, SUPER_ADMIN
    status VARCHAR(50) DEFAULT 'PENDING_PROFILE', -- PENDING_PROFILE, PENDING_ACTIVATION, ACTIVE, SUSPENDED
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,  
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL,
    preferred_contact VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    rejection_reason TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT TIMESTAMP
);
