import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { canAccessDashboard } from "@/lib/roles";

export async function getProfile() {
  // Use SSR client for auth (needs cookies)
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch profile with subsystem details
  const { data: profile } = await adminClient
    .from("profiles")
    .select(`
      *,
      subsystems (*)
    `)
    .eq("id", user.id)
    .single();

  // Validate profile role using centralized permissions
  if (profile && !canAccessDashboard(profile.role)) {
    return null;
  }

  return profile;
}
