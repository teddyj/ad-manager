-- Database initialization script for Campaign Builder
-- This runs automatically when the PostgreSQL container starts

-- Create extensions needed for the application
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For JSON indexing

-- Create a function to generate CUIDs (Collision-resistant Unique IDs)
-- This matches Prisma's cuid() function
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
DECLARE
    timestamp_part TEXT;
    counter_part TEXT;
    random_part TEXT;
BEGIN
    -- Simple CUID-like implementation for development
    timestamp_part := LPAD(EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT, 10, '0');
    counter_part := LPAD((RANDOM() * 1000)::INT::TEXT, 3, '0');
    random_part := SUBSTRING(MD5(RANDOM()::TEXT), 1, 16);
    
    RETURN 'c' || timestamp_part || counter_part || random_part;
END;
$$ LANGUAGE plpgsql;

-- Create development user with appropriate permissions
-- (The main dev_user is created by the container itself)

-- Create a simple logging table for development debugging
CREATE TABLE IF NOT EXISTS dev_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(10) NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the dev_logs table
CREATE INDEX IF NOT EXISTS idx_dev_logs_created_at ON dev_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_dev_logs_level ON dev_logs(level);

-- Insert a welcome message
INSERT INTO dev_logs (level, message, metadata) VALUES (
    'INFO', 
    'Campaign Builder development database initialized successfully',
    '{"version": "1.0", "environment": "development"}'
);

-- Set timezone for development
SET timezone = 'UTC';

-- Display initialization success
\echo 'Campaign Builder development database initialized successfully!'
\echo 'Database: campaign_builder_dev'
\echo 'User: dev_user'
\echo 'Extensions: uuid-ossp, pg_trgm, btree_gin'
\echo 'Custom functions: generate_cuid()' 