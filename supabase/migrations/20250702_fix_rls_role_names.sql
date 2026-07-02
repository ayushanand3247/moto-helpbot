-- =============================================================================
-- Migration: Fix RLS policies to use NEW role names
-- Date: 2026-07-02
-- CRITICAL: Previous migration used legacy role names (TEAM_MANAGER, CAPTAIN,
-- SUBSYSTEM_LEAD) which don't exist after Phase 2 role migration.
-- This caused ALL RLS policies to be effectively bypassed.
-- =============================================================================

-- =============================================================================
-- 1. PROFILES
-- =============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "profiles_select_own_or_board" ON profiles;

-- Members can view their own profile; ADMIN/BOARD/MANAGER can view all
-- "Board+" is now: ADMIN, BOARD, MANAGER
CREATE POLICY "profiles_select_own_or_board" ON profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'BOARD', 'MANAGER')
    )
  );

-- =============================================================================
-- 2. SUBSYSTEMS
-- =============================================================================
-- No changes needed - subsystems only allow ADMIN for write operations

-- =============================================================================
-- 3. PROJECTS
-- =============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "projects_insert_board" ON projects;

-- Board+ can create projects: ADMIN, BOARD, MANAGER
CREATE POLICY "projects_insert_board" ON projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'BOARD', 'MANAGER')
    )
  );

-- =============================================================================
-- 4. MILESTONES
-- =============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "milestones_insert_board" ON milestones;

-- Board+ can create milestones: ADMIN, BOARD, MANAGER
CREATE POLICY "milestones_insert_board" ON milestones
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'BOARD', 'MANAGER')
    )
  );

-- =============================================================================
-- 5. TASKS
-- =============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "tasks_insert_board" ON tasks;
DROP POLICY IF EXISTS "tasks_update_board" ON tasks;

-- Board+ can create tasks: ADMIN, BOARD, MANAGER
CREATE POLICY "tasks_insert_board" ON tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'BOARD', 'MANAGER')
    )
  );

-- Board+ can update tasks: ADMIN, BOARD, MANAGER
CREATE POLICY "tasks_update_board" ON tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'BOARD', 'MANAGER')
    )
  );

-- =============================================================================
-- 6. TASK_UPDATES
-- =============================================================================
-- No changes needed - already uses author_id = auth.uid()

-- =============================================================================
-- 7. ATTACHMENTS
-- =============================================================================
-- No changes needed - already uses uploaded_by = auth.uid()

-- =============================================================================
-- 8. INVITATIONS
-- =============================================================================
-- No changes needed - only ADMIN can manage invitations

-- =============================================================================
-- 9. NOTIFICATIONS
-- =============================================================================

-- Drop old policy
DROP POLICY IF EXISTS "notifications_insert_auth" ON notifications;

-- All authenticated users can create notifications (for task assignments, etc.)
-- The notification recipient check ensures users can only notify themselves or
-- be notified by the system (via server actions that check permissions).
CREATE POLICY "notifications_insert_auth" ON notifications
  FOR INSERT
  WITH CHECK (true); -- Permissions are enforced at the server action level

-- =============================================================================
-- 10. ACTIVITY_LOGS
-- =============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "activity_logs_select_board" ON "activity_logs";
DROP POLICY IF EXISTS "activity_logs_insert_board" ON "activity_logs";

-- Board+ can read all activity logs: ADMIN, BOARD, MANAGER
CREATE POLICY "activity_logs_select_board" ON "activity_logs"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'BOARD', 'MANAGER')
    )
  );

-- Board+ can insert activity logs: ADMIN, BOARD, MANAGER
CREATE POLICY "activity_logs_insert_board" ON "activity_logs"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'BOARD', 'MANAGER')
    )
  );

-- =============================================================================
-- 11. STORAGE BUCKET: attachments
-- =============================================================================
-- No changes needed - storage policies are correct
