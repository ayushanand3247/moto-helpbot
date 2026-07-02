const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing env vars');
  process.exit(1);
}
const adminClient = createClient(url, key);

const generatePasswordBase = (fullName) => {
  return `${fullName
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')}Moto`;
};

const normalizeSubsystemName = (value) =>
  typeof value === 'string'
    ? value.replace(/[\s\u00A0]+/g, ' ').trim().toLowerCase()
    : '';

(async () => {
  const importedUser = {
    full_name: 'Test User Debug',
    email: `debug+${Date.now()}@example.com`,
    subsystem_name: 'Vehicle Dynamics',
  };

  console.log('STEP 1');
  console.log('Parsed row:', importedUser);

  console.log('STEP 2');
  const { data: subsystems, error: subsystemsError } = await adminClient
    .from('subsystems')
    .select('id, name');
  if (subsystemsError) {
    console.log('Subsystem query error:', subsystemsError);
    process.exit(1);
  }
  console.log('Subsystem rows:', subsystems);
  const normalizedInput = normalizeSubsystemName(importedUser.subsystem_name);
  console.log('Raw subsystem string:', importedUser.subsystem_name);
  console.log('Trimmed subsystem string:', importedUser.subsystem_name.trim());
  console.log('Normalized subsystem string:', normalizedInput);
  const subsystemMatch = (subsystems || []).find(
    (s) => normalizeSubsystemName(s.name) === normalizedInput
  );
  console.log('Matched subsystem row:', subsystemMatch);
  console.log('Matched subsystem id:', subsystemMatch?.id ?? null);

  console.log('STEP 3');
  const base = generatePasswordBase(importedUser.full_name);
  const { data: existingProfiles, error: existingProfilesError } = await adminClient
    .from('profiles')
    .select('full_name');
  if (existingProfilesError) {
    console.log('Existing profiles query error:', existingProfilesError);
    process.exit(1);
  }
  console.log('Existing profiles count:', existingProfiles.length);
  const existingNames = new Map();
  existingProfiles.forEach((p) => {
    const b = generatePasswordBase(p.full_name);
    existingNames.set(b, (existingNames.get(b) || 0) + 1);
  });
  const dbCount = existingNames.get(base) || 0;
  const password = dbCount === 0 ? base : `${base}${dbCount}`;
  console.log('Generated password:', password);

  const authPayload = {
    email: importedUser.email.trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { full_name: importedUser.full_name.trim() },
  };
  console.log('Auth payload:', authPayload);
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser(authPayload);
  console.log('Auth createUser returned data:');
  console.dir(authData, { depth: null });
  console.log('Auth createUser returned error:');
  console.dir(authError, { depth: null });
  if (authError) {
    process.exit(1);
  }

  console.log('STEP A');
  console.log('Created auth user id:', authData.user.id);
  const { data: existingProfile, error: existingProfileError } = await adminClient
    .from('profiles')
    .select('id')
    .eq('id', authData.user.id)
    .maybeSingle();
  console.log('Existing profile select returned data:');
  console.dir(existingProfile, { depth: null });
  console.log('Existing profile select returned error:');
  console.dir(existingProfileError, { depth: null });

  const payload = {
    email: importedUser.email.trim().toLowerCase(),
    full_name: importedUser.full_name.trim(),
    role: 'MEMBER',
    subsystem_id: subsystemMatch?.id ?? null,
    is_active: true,
  };

  if (existingProfile) {
    console.log('STEP B: existing profile found, updating');
    const { data: updateData, error: updateError } = await adminClient
      .from('profiles')
      .update(payload)
      .eq('id', authData.user.id);
    console.log('Update response:');
    console.dir(updateData, { depth: null });
    console.log('Update error:');
    console.dir(updateError, { depth: null });
    if (updateError) {
      console.log('Profile update failed');
      process.exit(1);
    }
  } else {
    console.log('STEP B: no profile found, inserting');
    const insertPayload = {
      id: authData.user.id,
      ...payload,
    };
    console.log('Insert payload:', insertPayload);
    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .insert(insertPayload);
    console.log('Insert response:');
    console.dir(profileData, { depth: null });
    console.log('Insert error:');
    console.dir(profileError, { depth: null });
    if (profileError) {
      console.log('Profile insert failed');
      process.exit(1);
    }
  }

  console.log('STEP 5');
  console.log('Returned success object:');
  const result = {
    ...importedUser,
    password,
    status: 'success',
  };
  console.log(result);
})();
