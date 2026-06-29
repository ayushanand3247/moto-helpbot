/**
 * Server mutation client — uses service role key to bypass RLS.
 *
 * Use this for ALL server actions that perform mutations (INSERT, UPDATE, DELETE).
 * Permission checks should be done explicitly in the action code.
 *
 * The regular server client (anon key) is subject to RLS policies which
 * may not work correctly in Next.js 16 server actions due to cookie handling.
 */

import { adminClient } from "./admin";

export function getMutationClient() {
  return adminClient;
}
