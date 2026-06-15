-- 045_role_transitions.sql
-- Append-only audit trail for supported identity/role transitions.

BEGIN;

CREATE TABLE IF NOT EXISTS role_transitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  previous_role TEXT,
  next_role TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (previous_role IS NULL OR previous_role <> next_role)
);

CREATE INDEX IF NOT EXISTS role_transitions_user_id_idx
  ON role_transitions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS role_transitions_next_role_idx
  ON role_transitions (next_role, created_at DESC);

ALTER TABLE role_transitions ENABLE ROW LEVEL SECURITY;

COMMIT;
