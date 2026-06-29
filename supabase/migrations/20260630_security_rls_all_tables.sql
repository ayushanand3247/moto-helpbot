-- =============================================================================
-- Migration: Enable RLS and add security policies on ALL public tables
-- Date: 2026-06-30
-- Critical security fix — previously only task_assignments had RLS enabled.
-- =============================================================================

-- =============================================================================
-- 1. PROFILES
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Members can view their own profile; board+ can view all
CREATE POLICY "profiles_select_own_or_board" ON profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'TEAM_MANAGER', 'CAPTAIN', 'SUBSYSTEM_LEAD')
    )
  );

-- Users can update their own profile (not role/subsystem — those are admin-only)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can insert new profiles (e.g. via bulk import)
CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can delete profiles
CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =============================================================================
-- 2. SUBSYSTEMS
-- =============================================================================
ALTER TABLE subsystems ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read subsystems (needed for dropdowns)
CREATE POLICY "subsystems_select_all" ON subsystems
  FOR SELECT
  USING (true);

-- Only admins can create/update/delete subsystems
CREATE POLICY "subsystems_insert_admin" ON subsystems
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "subsystems_update_admin" ON subsystems
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "subsystems_delete_admin" ON subsystems
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- =============================================================================
-- 3. PROJECTS
-- =============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Authenticated users can see all projects
CREATE POLICY "projects_select_all" ON projects
  FOR SELECT
  USING (true);

-- Board+ can create projects
CREATE POLICY "projects_insert_board" ON projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'TEAM_MANAGER', 'CAPTAIN', 'SUBSYSTEM_LEAD')
    )
  );

-- Admin can update/delete projects
CREATE POLICY "projects_update_admin" ON projects
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "projects_delete_admin" ON projects
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- =============================================================================
-- 4. MILESTONES
-- =============================================================================
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read milestones
CREATE POLICY "milestones_select_all" ON milestones
  FOR SELECT
  USING (true);

-- Board+ can create milestones
CREATE POLICY "milestones_insert_board" ON milestones
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'TEAM_MANAGER', 'CAPTAIN', 'SUBSYSTEM_LEAD')
    )
  );

-- Admin can update/delete
CREATE POLICY "milestones_update_admin" ON milestones
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "milestones_delete_admin" ON milestones
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- =============================================================================
-- 5. TASKS
-- =============================================================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read tasks
CREATE POLICY "tasks_select_all" ON tasks
  FOR SELECT
  USING (true);

-- Board+ can create tasks
CREATE POLICY "tasks_insert_board" ON tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'TEAM_MANAGER', 'CAPTAIN', 'SUBSYSTEM_LEAD')
    )
  );

-- Board+ can update tasks
CREATE POLICY "tasks_update_board" ON tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'TEAM_MANAGER', 'CAPTAIN', 'SUBSYSTEM_LEAD')
    )
  );

-- Admin can delete tasks
CREATE POLICY "tasks_delete_admin" ON tasks
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- =============================================================================
-- 6. TASK_UPDATES
-- =============================================================================
ALTER TABLE task_updates ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read task updates
CREATE POLICY "task_updates_select_all" ON task_updates
  FOR SELECT
  USING (true);

-- Authenticated users can create task updates (progress, comments, etc.)
CREATE POLICY "task_updates_insert_auth" ON task_updates
  FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Users can update their own updates
CREATE POLICY "task_updates_update_own" ON task_updates
  FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- =============================================================================
-- 7. ATTACHMENTS
-- =============================================================================
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read attachments
CREATE POLICY "attachments_select_all" ON attachments
  FOR SELECT
  USING (true);

-- Authenticated users can upload attachments
CREATE POLICY "attachments_insert_auth" ON attachments
  FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- Users can delete their own attachments
CREATE POLICY "attachments_delete_own" ON attachments
  FOR DELETE
  USING (uploaded_by = auth.uid());

-- =============================================================================
-- 8. INVITATIONS
-- =============================================================================
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Only admins can see invitations
CREATE POLICY "invitations_select_admin" ON invitations
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Only admins can create invitations
CREATE POLICY "invitations_insert_admin" ON invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Only admins can update/delete invitations
CREATE POLICY "invitations_update_admin" ON invitations
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "invitations_delete_admin" ON invitations
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- =============================================================================
-- 9. NOTIFICATIONS
-- =============================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT
  USING (recipient_id = auth.uid());

-- Authenticated users can create notifications (for notifying others)
CREATE POLICY "notifications_insert_auth" ON notifications
  FOR INSERT
  WITH CHECK (recipient_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
      AND role IN ('ADMIN', 'TEAM_MANAGER', 'CAPTAIN', 'SUBSYSTEM_LEAD')
  ));

-- Users can update their own notifications (e.g. mark as read)
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- =============================================================================
-- 10. ACTIVITY_LOGS (read-only for board+)
-- =============================================================================
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Board+ can read all activity logs
CREATE POLICY "activity_logs_select_board" ON activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'TEAM_MANAGER', 'CAPTAIN', 'SUBSYSTEM_LEAD')
    )
  );

-- Only system/board can insert (never from client directly)
CREATE POLICY "activity_logs_insert_board" ON activity_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
        AND role IN ('ADMIN', 'TEAM_MANAGER', 'CAPTAIN', 'SUBSYSTEM_LEAD')
    )
  );

-- =============================================================================
-- 11. STORAGE BUCKET: attachments
-- =============================================================================
-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT DO NOTHING;

-- RLS policies for storage objects
CREATE POLICY "storage_attachments_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'attachments');

-- Authenticated users can upload to their own folder
CREATE POLICY "storage_attachments_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update/delete their own files
CREATE POLICY "storage_attachments_update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "storage_attachments_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
