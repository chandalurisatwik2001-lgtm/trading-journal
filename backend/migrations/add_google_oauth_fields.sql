-- Migration: Add Google OAuth fields to users table
-- Run this SQL in your Supabase SQL Editor

-- Add google_id column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR UNIQUE;

-- Add profile_picture column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR;

-- Add auth_provider column with enum type
DO $$ 
BEGIN
    -- Create enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'authprovider') THEN
        CREATE TYPE authprovider AS ENUM ('email', 'google');
    END IF;
END $$;

-- Add auth_provider column with default value
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider authprovider DEFAULT 'email' NOT NULL;

-- Create index on google_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Make hashed_password nullable (Google users don't need it initially)
ALTER TABLE users 
ALTER COLUMN hashed_password DROP NOT NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('google_id', 'profile_picture', 'auth_provider', 'hashed_password')
ORDER BY column_name;
