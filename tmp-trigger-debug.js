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
async function inspect() {
  const queries = [
    {
      label: 'information_schema_triggers_auth_users',
      sql: `SELECT trigger_schema, trigger_name, event_manipulation, event_object_table, action_timing, action_statement FROM information_schema.triggers WHERE event_object_schema = 'auth' AND event_object_table = 'users' ORDER BY trigger_name;`,
    },
    {
      label: 'information_schema_triggers_profiles',
      sql: `SELECT trigger_schema, trigger_name, event_manipulation, event_object_table, action_timing, action_statement FROM information_schema.triggers WHERE event_object_schema = 'public' AND event_object_table = 'profiles' ORDER BY trigger_name;`,
    },
    {
      label: 'pg_trigger_auth_users',
      sql: `SELECT tgname, pg_get_triggerdef(oid) AS trigger_def FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass ORDER BY tgname;`,
    },
    {
      label: 'pg_trigger_profiles',
      sql: `SELECT tgname, pg_get_triggerdef(oid) AS trigger_def FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass ORDER BY tgname;`,
    },
    {
      label: 'pg_proc_profile_functions',
      sql: `SELECT proname, pg_get_functiondef(oid) AS function_def FROM pg_proc WHERE proname ILIKE '%profile%' ORDER BY proname;`,
    },
  ];
  for (const q of queries) {
    try {
      const { data, error } = await adminClient
        .from('pg_catalog.pg_tables')
        .select('*')
        .limit(1);
      // Just to ensure client works
    } catch (err) {
      // ignore
    }
    console.log('---', q.label, '---');
    try {
      const response = await adminClient.rpc('sql', { sql: q.sql });
      console.log('rpc response', response);
    } catch (rpcError) {
      console.error('rpc error', rpcError);
    }
    try {
      const raw = await adminClient.from('information_schema.triggers').select('trigger_schema, trigger_name, event_manipulation, event_object_table, action_timing, action_statement').eq('event_object_table', 'users');
      console.log('raw info schema result', raw);
    } catch (err) {
      // ignore
    }
  }
}
inspect().catch((err) => {
  console.error(err);
});
