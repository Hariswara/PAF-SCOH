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
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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


-- Resources Table (Module A - Facilities & Assets Catalogue)
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,          -- LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    capacity INTEGER,
    location VARCHAR(255) NOT NULL,
    availability_windows VARCHAR(255),
    status VARCHAR(50) NOT NULL,        -- ACTIVE, OUT_OF_SERVICE
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);