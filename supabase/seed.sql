-- =============================================================================
-- Seed: Initial data for MotoManipal
-- Run this after migrations to populate required data.
-- Usage: psql $DATABASE_URL -f supabase/seed.sql
-- =============================================================================

-- ── Subsystems ──────────────────────────────────────────────────────────────
INSERT INTO subsystems (name, icon, color) VALUES
  ('Structures', '🏗️', '#3b82f6'),
  ('Transmission', '⚙️', '#22c55e'),
  ('Vehicle Dynamics', '🛞', '#f59e0b'),
  ('Aerodynamics', '🌀', '#8b5cf6'),
  ('EPT (Electrical, Powertrain & Telemetry)', '⚡', '#ef4444'),
  ('Machine Learning', '🤖', '#06b6d4'),
  ('Management', '📋', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- ── Admin user ─────────────────────────────────────────────────────────────
-- This must be created via the Supabase Auth admin API or dashboard.
-- After creating the auth user, run the following to set up the profile:
-- UPDATE profiles SET role = 'ADMIN', is_active = true WHERE email = 'admin@motomanipal.com';
-- If the profile doesn't exist:
-- INSERT INTO profiles (id, email, full_name, role, is_active)
-- VALUES ('<AUTH_USER_ID>', 'admin@motomanipal.com', 'Admin', 'ADMIN', true);

-- ── Helper: Create a new user with profile ─────────────────────────────────
-- Use the Supabase dashboard or admin API to create auth users,
-- then ensure the profile is created with the correct role.

-- Example for bulk creation:
-- DO $$
-- DECLARE
--   user_id UUID;
--   subsystem_id UUID;
-- BEGIN
--   -- Get subsystem ID
--   SELECT id INTO subsystem_id FROM subsystems WHERE name = 'Management' LIMIT 1;
--
--   -- Insert auth user would be done via admin API
--   -- Then create profile:
--   INSERT INTO profiles (id, email, full_name, role, subsystem_id, is_active)
--   VALUES (gen_random_uuid(), 'user@example.com', 'User Name', 'MEMBER', subsystem_id, true);
-- END $$;
