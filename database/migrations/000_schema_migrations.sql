-- Schema migrations tracking table
-- This should be run first to track all future migrations

CREATE TABLE IF NOT EXISTS public.schema_migrations (
    version VARCHAR(20) PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    checksum VARCHAR(64)
);

-- Insert the initial migration tracker
INSERT INTO public.schema_migrations (version, description, applied_at)
VALUES ('000', 'Schema migrations tracking table', NOW())
ON CONFLICT (version) DO NOTHING;


