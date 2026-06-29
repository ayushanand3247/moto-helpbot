-- =============================================================================
-- Migration: task_assignments junction table + subsystem standardization
-- Date: 2026-06-28
-- Safe to run once (idempotent where possible)
-- =============================================================================

-- =============================================================================
-- PART 1: SUBSYSTEM STANDARDIZATION
-- Merge "Electronics" and "Electrical" into "EPT (Electrical, Powertrain & Telemetry)"
-- Standard list: Structures, Mechanical, EPT, Machine Learning & Controls, Aerodynamics, Management
-- =============================================================================

-- Step 1a: Ensure EPT subsystem exists
INSERT INTO subsystems (name)
VALUES ('EPT (Electrical, Powertrain & Telemetry)')
ON CONFLICT DO NOTHING;

-- Step 1b: Migrate all references from Electronics → EPT
UPDATE profiles
SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'EPT (Electrical, Powertrain & Telemetry)' LIMIT 1)
WHERE subsystem_id IN (SELECT id FROM subsystems WHERE name IN ('Electronics', 'Electrical'));

UPDATE tasks
SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'EPT (Electrical, Powertrain & Telemetry)' LIMIT 1)
WHERE subsystem_id IN (SELECT id FROM subsystems WHERE name IN ('Electronics', 'Electrical'));

UPDATE projects
SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'EPT (Electrical, Powertrain & Telemetry)' LIMIT 1)
WHERE subsystem_id IN (SELECT id FROM subsystems WHERE name IN ('Electronics', 'Electrical'));

UPDATE invitations
SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'EPT (Electrical, Powertrain & Telemetry)' LIMIT 1)
WHERE subsystem_id IN (SELECT id FROM subsystems WHERE name IN ('Electronics', 'Electrical'));

-- Step 1c: Rename "Powertrain" → "Mechanical" if it exists (standardization)
DO $$
DECLARE
  powertrain_id UUID;
  ept_id UUID;
BEGIN
  SELECT id INTO powertrain_id FROM subsystems WHERE name = 'Powertrain' LIMIT 1;
  SELECT id INTO ept_id FROM subsystems WHERE name = 'EPT (Electrical, Powertrain & Telemetry)' LIMIT 1;

  IF powertrain_id IS NOT NULL THEN
    -- Migrate profiles from Powertrain → Mechanical
    UPDATE profiles SET subsystem_id = (
      CASE WHEN EXISTS (SELECT 1 FROM subsystems WHERE name = 'Mechanical')
        THEN (SELECT id FROM subsystems WHERE name = 'Mechanical' LIMIT 1)
        ELSE NULL END
    ) WHERE subsystem_id = powertrain_id;

    -- If Mechanical doesn't exist, rename Powertrain in place
    IF NOT EXISTS (SELECT 1 FROM subsystems WHERE name = 'Mechanical') THEN
      UPDATE subsystems SET name = 'Mechanical' WHERE id = powertrain_id;
    ELSE
      UPDATE tasks SET subsystem_id = (
        SELECT id FROM subsystems WHERE name = 'Mechanical' LIMIT 1
      ) WHERE subsystem_id = powertrain_id;

      UPDATE projects SET subsystem_id = (
        SELECT id FROM subsystems WHERE name = 'Mechanical' LIMIT 1
      ) WHERE subsystem_id = powertrain_id;

      UPDATE invitations SET subsystem_id = (
        SELECT id FROM subsystems WHERE name = 'Mechanical' LIMIT 1
      ) WHERE subsystem_id = powertrain_id;

      DELETE FROM subsystems WHERE id = powertrain_id;
    END IF;
  END IF;
END $$;

-- Step 1d: Ensure all 6 standardized subsystems exist
INSERT INTO subsystems (name) VALUES ('Structures') ON CONFLICT DO NOTHING;
INSERT INTO subsystems (name) VALUES ('Mechanical') ON CONFLICT DO NOTHING;
INSERT INTO subsystems (name) VALUES ('EPT (Electrical, Powertrain & Telemetry)') ON CONFLICT DO NOTHING;
INSERT INTO subsystems (name) VALUES ('Machine Learning & Controls') ON CONFLICT DO NOTHING;
INSERT INTO subsystems (name) VALUES ('Aerodynamics') ON CONFLICT DO NOTHING;
INSERT INTO subsystems (name) VALUES ('Management') ON CONFLICT DO NOTHING;

-- Step 1e: Rename legacy ML variants
UPDATE profiles
SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'Machine Learning & Controls' LIMIT 1)
WHERE subsystem_id IN (
  SELECT id FROM subsystems
  WHERE name IN ('ML', 'ML & Controls', 'Vehicle Dynamics', 'Vehicle_Dynamics', 'ML & Controls')
  AND name != 'Machine Learning & Controls'
);

UPDATE tasks
SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'Machine Learning & Controls' LIMIT 1)
WHERE subsystem_id IN (
  SELECT id FROM subsystems
  WHERE name IN ('ML', 'ML & Controls', 'Vehicle Dynamics', 'Vehicle_Dynamics', 'ML & Controls')
  AND name != 'Machine Learning & Controls'
);

UPDATE projects
SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'Machine Learning & Controls' LIMIT 1)
WHERE subsystem_id IN (
  SELECT id FROM subsystems
  WHERE name IN ('ML', 'ML & Controls', 'Vehicle Dynamics', 'Vehicle_Dynamics', 'ML & Controls')
  AND name != 'Machine Learning & Controls'
);

-- Step 1f: Delete orphaned legacy subsystems (only if no references remain)
DELETE FROM subsystems
WHERE name IN ('Electronics', 'Electrical', 'Powertrain', 'ML', 'Vehicle Dynamics', 'Vehicle_Dynamics')
AND id NOT IN (SELECT DISTINCT subsystem_id FROM profiles WHERE subsystem_id IS NOT NULL)
AND id NOT IN (SELECT DISTINCT subsystem_id FROM tasks WHERE subsystem_id IS NOT NULL)
AND id NOT IN (SELECT DISTINCT subsystem_id FROM projects WHERE subsystem_id IS NOT NULL)
AND id NOT IN (SELECT DISTINCT subsystem_id FROM invitations WHERE subsystem_id IS NOT NULL);

-- =============================================================================
-- PART 2: TASK_ASSIGNMENTS JUNCTION TABLE
-- =============================================================================

-- Step 2a: Create the junction table
CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Prevent duplicate assignments
  UNIQUE (task_id, user_id)
);

-- Step 2b: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user_id ON task_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_by ON task_assignments(assigned_by);

-- Step 2c: Enable Row Level Security
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- Step 2d: RLS Policies
-- Users can view assignments for tasks they can see
CREATE POLICY "task_assignments_select_policy" ON task_assignments
  FOR SELECT
  USING (
    -- Task creator can see
    task_id IN (SELECT id FROM tasks WHERE created_by = auth.uid())
    OR
    -- Assigned user can see their own
    user_id = auth.uid()
    OR
    -- Leads+ can see all
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'TEAM_MANAGER', 'CAPTAIN', 'SUBSYSTEM_LEAD'))
  );

-- Only leads+ can insert assignments
CREATE POLICY "task_assignments_insert_policy" ON task_assignments
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'TEAM_MANAGER', 'CAPTAIN', 'SUBSYSTEM_LEAD'))
  );

-- Only leads+ can delete assignments
CREATE POLICY "task_assignments_delete_policy" ON task_assignments
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'TEAM_MANAGER', 'CAPTAIN', 'SUBSYSTEM_LEAD'))
  );

-- =============================================================================
-- PART 3: MIGRATE EXISTING DATA
-- Copy every existing assigned_user_id into the new junction table
-- =============================================================================

INSERT INTO task_assignments (task_id, user_id, assigned_at, assigned_by)
SELECT
  t.id AS task_id,
  t.assigned_to AS user_id,
  COALESCE(t.created_at, NOW()) AS assigned_at,
  t.created_by AS assigned_by
FROM tasks t
WHERE t.assigned_to IS NOT NULL
ON CONFLICT (task_id, user_id) DO NOTHING;

-- =============================================================================
-- PART 4: HELPER FUNCTION for fetching task assignees
-- =============================================================================

CREATE OR REPLACE FUNCTION get_task_assignees(task_uuid UUID)
RETURNS TABLE(profile_id UUID, full_name TEXT, avatar_url TEXT, email TEXT, subsystem_id UUID)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT p.id, p.full_name, p.avatar_url, p.email, p.subsystem_id
  FROM task_assignments ta
  JOIN profiles p ON p.id = ta.user_id
  WHERE ta.task_id = task_uuid
  ORDER BY p.full_name;
$$;
