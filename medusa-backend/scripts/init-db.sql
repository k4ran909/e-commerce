-- ============================================
-- JEWELRY COMMERCE - DATABASE INITIALIZATION
-- This script runs when PostgreSQL container starts
-- ============================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE jewelry_commerce_db TO jewelry_admin;

-- Create indexes for performance (optional, Medusa creates its own)
-- These are created after Medusa migrations run

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Jewelry Commerce database initialized successfully at %', NOW();
END $$;
