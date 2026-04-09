-- Migration V3: Add contact_email and gender columns to users table
-- Run this on existing databases that already have the users table.

ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
