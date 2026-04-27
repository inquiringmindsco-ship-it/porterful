-- Migration 016: Add featured column to tracks table
-- Created: 2026-04-27

BEGIN;

-- Add featured column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tracks' AND column_name = 'featured'
    ) THEN
        ALTER TABLE tracks ADD COLUMN featured BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

COMMIT;
