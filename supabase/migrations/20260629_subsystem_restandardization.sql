-- =============================================================================
-- Migration: Correct subsystem standardization to match official MotoManipal structure
-- Date: 2026-06-29
-- Follow-up to 20260628 migration — adjusts names to match final spec
-- Standard list: Structures, Transmission, Vehicle Dynamics, Aerodynamics,
--                EPT (Electrical, Powertrain & Telemetry), Machine Learning, Management
-- =============================================================================

-- PART 1: RENAMING (conflict-aware using DO blocks)

-- 1a. Mechanical → Transmission (merge if Transmission already exists)
DO $$
DECLARE
  mech_id UUID;
  trans_id UUID;
BEGIN
  SELECT id INTO mech_id FROM subsystems WHERE name = 'Mechanical' LIMIT 1;
  SELECT id INTO trans_id FROM subsystems WHERE name = 'Transmission' LIMIT 1;

  IF mech_id IS NOT NULL THEN
    IF trans_id IS NOT NULL THEN
      -- Transmission exists — merge Mechanical into it
      UPDATE profiles SET subsystem_id = trans_id WHERE subsystem_id = mech_id;
      UPDATE tasks SET subsystem_id = trans_id WHERE subsystem_id = mech_id;
      UPDATE projects SET subsystem_id = trans_id WHERE subsystem_id = mech_id;
      UPDATE invitations SET subsystem_id = trans_id WHERE subsystem_id = mech_id;
      DELETE FROM subsystems WHERE id = mech_id;
    ELSE
      -- No Transmission yet — just rename
      UPDATE subsystems SET name = 'Transmission' WHERE id = mech_id;
    END IF;
  END IF;
END $$;

-- 1b. Machine Learning & Controls → Machine Learning (merge if Machine Learning exists)
DO $$
DECLARE
  mlc_id UUID;
  ml_id UUID;
BEGIN
  SELECT id INTO mlc_id FROM subsystems WHERE name = 'Machine Learning & Controls' LIMIT 1;
  SELECT id INTO ml_id FROM subsystems WHERE name = 'Machine Learning' LIMIT 1;

  IF mlc_id IS NOT NULL THEN
    IF ml_id IS NOT NULL THEN
      UPDATE profiles SET subsystem_id = ml_id WHERE subsystem_id = mlc_id;
      UPDATE tasks SET subsystem_id = ml_id WHERE subsystem_id = mlc_id;
      UPDATE projects SET subsystem_id = ml_id WHERE subsystem_id = mlc_id;
      UPDATE invitations SET subsystem_id = ml_id WHERE subsystem_id = mlc_id;
      DELETE FROM subsystems WHERE id = mlc_id;
    ELSE
      UPDATE subsystems SET name = 'Machine Learning' WHERE id = mlc_id;
    END IF;
  END IF;
END $$;

-- PART 2: HANDLE POWERTRAIN (merge into Transmission)
DO $$
DECLARE
  pt_id UUID;
  trans_id UUID;
BEGIN
  SELECT id INTO pt_id FROM subsystems WHERE name = 'Powertrain' LIMIT 1;
  SELECT id INTO trans_id FROM subsystems WHERE name = 'Transmission' LIMIT 1;

  IF pt_id IS NOT NULL THEN
    IF trans_id IS NOT NULL THEN
      UPDATE profiles SET subsystem_id = trans_id WHERE subsystem_id = pt_id;
      UPDATE tasks SET subsystem_id = trans_id WHERE subsystem_id = pt_id;
      UPDATE projects SET subsystem_id = trans_id WHERE subsystem_id = pt_id;
      UPDATE invitations SET subsystem_id = trans_id WHERE subsystem_id = pt_id;
      DELETE FROM subsystems WHERE id = pt_id;
    ELSE
      UPDATE subsystems SET name = 'Transmission' WHERE id = pt_id;
    END IF;
  END IF;
END $$;

-- PART 3: ENSURE FULL STANDARDIZED LIST EXISTS
INSERT INTO subsystems (name) VALUES ('Structures') ON CONFLICT DO NOTHING;
INSERT INTO subsystems (name) VALUES ('Transmission') ON CONFLICT DO NOTHING;
INSERT INTO subsystems (name) VALUES ('Vehicle Dynamics') ON CONFLICT DO NOTHING;
INSERT INTO subsystems (name) VALUES ('Aerodynamics') ON CONFLICT DO NOTHING;
INSERT INTO subsystems (name) VALUES ('EPT (Electrical, Powertrain & Telemetry)') ON CONFLICT DO NOTHING;
INSERT INTO subsystems (name) VALUES ('Machine Learning') ON CONFLICT DO NOTHING;
INSERT INTO subsystems (name) VALUES ('Management') ON CONFLICT DO NOTHING;

-- PART 4: MIGRATE LEGACY ML VARIANTS
UPDATE profiles SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'Machine Learning' LIMIT 1)
WHERE subsystem_id IN (
  SELECT id FROM subsystems
  WHERE name IN ('ML', 'ML & Controls', 'Motion Planning', 'Controls', 'Software')
  AND name != 'Machine Learning'
);

UPDATE tasks SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'Machine Learning' LIMIT 1)
WHERE subsystem_id IN (
  SELECT id FROM subsystems
  WHERE name IN ('ML', 'ML & Controls', 'Motion Planning', 'Controls', 'Software')
  AND name != 'Machine Learning'
);

UPDATE projects SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'Machine Learning' LIMIT 1)
WHERE subsystem_id IN (
  SELECT id FROM subsystems
  WHERE name IN ('ML', 'ML & Controls', 'Motion Planning', 'Controls', 'Software')
  AND name != 'Machine Learning'
);

-- PART 5: MIGRATE ANY VEHICLE DYNAMICS VARIANTS
UPDATE profiles SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'Vehicle Dynamics' LIMIT 1)
WHERE subsystem_id IN (
  SELECT id FROM subsystems
  WHERE name IN ('Vehicle Dynamics', 'Vehicle_Dynamics', 'Dynamics', 'Suspension')
  AND name != 'Vehicle Dynamics'
);

UPDATE tasks SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'Vehicle Dynamics' LIMIT 1)
WHERE subsystem_id IN (
  SELECT id FROM subsystems
  WHERE name IN ('Vehicle Dynamics', 'Vehicle_Dynamics', 'Dynamics', 'Suspension')
  AND name != 'Vehicle Dynamics'
);

UPDATE projects SET subsystem_id = (SELECT id FROM subsystems WHERE name = 'Vehicle Dynamics' LIMIT 1)
WHERE subsystem_id IN (
  SELECT id FROM subsystems
  WHERE name IN ('Vehicle Dynamics', 'Vehicle_Dynamics', 'Dynamics', 'Suspension')
  AND name != 'Vehicle Dynamics'
);

-- PART 6: DELETE ORPHANED LEGACY SUBSYSTEMS
DELETE FROM subsystems
WHERE name IN ('Mechanical', 'Machine Learning & Controls', 'ML', 'ML & Controls',
              'Vehicle_Dynamics', 'Dynamics', 'Suspension', 'Controls',
              'Motion Planning', 'Software', 'Powertrain', 'Electronics', 'Electrical')
AND id NOT IN (SELECT DISTINCT subsystem_id FROM profiles WHERE subsystem_id IS NOT NULL)
AND id NOT IN (SELECT DISTINCT subsystem_id FROM tasks WHERE subsystem_id IS NOT NULL)
AND id NOT IN (SELECT DISTINCT subsystem_id FROM projects WHERE subsystem_id IS NOT NULL)
AND id NOT IN (SELECT DISTINCT subsystem_id FROM invitations WHERE subsystem_id IS NOT NULL);
