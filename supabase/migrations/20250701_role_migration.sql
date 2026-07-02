-- =============================================================================
-- Migration: Migrate from legacy role system to new role model
-- Date: 2026-07-01
-- MIGRATED FROM: "TEAM_MANAGER" | "CAPTAIN" | "SUBSYSTEM_LEAD"
-- MIGRATED TO: "ADMIN" | "BOARD" | "MANAGER" | "MEMBER"
-- =============================================================================

-- STEP 1: Add new enum values
-- =============================================================================

-- Add BOARD role to the user_role enum
DO $$
BEGIN
  -- Check if BOARD already exists in the enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    RAISE EXCEPTION 'user_role enum does not exist';
  END IF;

  -- Check if BOARD value already exists
  IF EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'BOARD' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
    RAISE NOTICE 'BOARD role already exists in enum';
  ELSE
    ALTER TYPE user_role ADD VALUE 'BOARD' BEFORE 'MEMBER';
    RAISE NOTICE 'Added BOARD role to user_role enum';
  END IF;
END $$;

-- Add MANAGER role to the user_role enum (if not present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MANAGER' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
    ALTER TYPE user_role ADD VALUE 'MANAGER' AFTER 'ADMIN';
    RAISE NOTICE 'Added MANAGER role to user_role enum';
  END IF;
END $$;

-- STEP 2: Update existing rows with legacy roles
-- =============================================================================

-- Update TEAM_MANAGER to MANAGER
UPDATE profiles
SET role = 'MANAGER'
WHERE role = 'TEAM_MANAGER';

-- Update CAPTAIN to MANAGER
UPDATE profiles
SET role = 'MANAGER'
WHERE role = 'CAPTAIN';

-- Update SUBSYSTEM_LEAD to MEMBER
UPDATE profiles
SET role = 'MEMBER'
WHERE role = 'SUBSYSTEM_LEAD';

-- Update invitations table
UPDATE invitations
SET role = 'MANAGER'
WHERE role = 'TEAM_MANAGER';

UPDATE invitations
SET role = 'MANAGER'
WHERE role = 'CAPTAIN';

UPDATE invitations
SET role = 'MEMBER'
WHERE role = 'SUBSYSTEM_LEAD';

-- STEP 3: Remove legacy enum values
-- =============================================================================

-- NOTE: In PostgreSQL, we cannot directly remove enum values from an existing enum.
-- Instead, we need to create a temporary enum with the new values,
-- convert all data, and then replace the old enum.

-- This requires a more complex approach. For now, we'll keep the legacy values
-- in the enum since PostgreSQL doesn't support direct removal in runtime migrations.

-- To safely remove legacy roles, we would need to:
-- 1. Create a new enum with only the desired values
-- 2. Convert all table data to use the new enum
-- 3. Drop the old enum
-- 4. Rename the new enum to replace the old one

-- However, this is a complex operation that carries risks and requires downtime.
-- For production safety, we'll keep the old enum values but mark them as deprecated.

-- STEP 4: Mark legacy roles as deprecated in profiles
-- =============================================================================

-- Create a tracking table to monitor legacy role migration
CREATE TABLE IF NOT EXISTS role_migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  legacy_role TEXT,
  current_role TEXT,
  migrated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Log the migration
INSERT INTO role_migration_log (user_id, legacy_role, current_role)
SELECT id, 'TEAM_MANAGER', 'MANAGER' FROM profiles WHERE role = 'TEAM_MANAGER'
UNION
SELECT id, 'CAPTAIN', 'MANAGER' FROM profiles WHERE role = 'CAPTAIN'
UNION
SELECT id, 'SUBSYSTEM_LEAD', 'MEMBER' FROM profiles WHERE role = 'SUBSYSTEM_LEAD';

-- STEP 5: Update RLS policies to reference new roles
-- =============================================================================

-- Note: RLS policies will be updated in a separate migration (Phase 2.7)

-- STEP 6: Create helper function for future migrations
-- =============================================================================

CREATE OR REPLACE FUNCTION legacy_to_new_role(legacy_role TEXT)
RETURNS TEXT AS $$
BEGIN
  CASE legacy_role
    WHEN 'TEAM_MANAGER' THEN RETURN 'MANAGER';
    WHEN 'CAPTAIN' THEN RETURN 'MANAGER';
    WHEN 'SUBSYSTEM_LEAD' THEN RETURN 'MEMBER';
    ELSE RETURN legacy_role;
  END CASE;
END;
$$ LANGUAGE plpgsql;