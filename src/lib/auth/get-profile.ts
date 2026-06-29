import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function getProfile() {
  // Use SSR client for auth (needs cookies)
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Use admin client for profile query (faster, no RLS)
  const { data: profile } = await adminClient
    .from("profiles")
    .select(`
      *,
      subsystems (*)
    `)
    .eq("id", user.id)
    .single();

  return profile;
}
