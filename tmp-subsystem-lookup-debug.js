const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing env vars');
  process.exit(1);
}

const client = createClient(url, key);

(async () => {
  const { data, error } = await client.from('subsystems').select('id, name').order('id');
  if (error) {
    console.error('DB error:', error);
    process.exit(1);
  }

  const test = 'Vehicle Dynamics';
  const normalize = (value) =>
    typeof value === 'string'
      ? value
          .replace(/[\s\u00A0]+/g, ' ')
          .trim()
          .toLowerCase()
      : value;

  console.log('TEST RAW:', test);
  console.log('type:', typeof test);
  console.log('json:', JSON.stringify(test));
  console.log('trimmed:', test.trim());
  console.log('normalized:', normalize(test));
  console.log('---');

  data.forEach((row, index) => {
    const raw = row.name;
    const trimmed = typeof raw === 'string' ? raw.trim() : raw;
    const normalized = normalize(raw);
    console.log(`row ${index}`);
    console.log('  id:', row.id);
    console.log('  raw:', raw);
    console.log('  type:', typeof raw);
    console.log('  json:', JSON.stringify(raw));
    console.log('  trimmed:', trimmed);
    console.log('  normalized:', normalized);
    console.log('  compare with test normalized:', normalized === normalize(test));
    console.log('  raw codepoints:', typeof raw === 'string' ? raw.split('').map((c) => c.charCodeAt(0)).join(' ') : 'n/a');
    console.log('---');
  });

  const match = data.find((row) => normalize(row.name) === normalize(test));
  console.log('MATCH:', match ? JSON.stringify(match) : 'NONE');
})();
