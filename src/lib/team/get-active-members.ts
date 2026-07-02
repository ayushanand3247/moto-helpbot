import { adminClient } from "@/lib/supabase/admin";

export async function getActiveMembers() {
  const { data, error } = await adminClient
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      role
    `)
    .eq("is_active", true)
    .neq("role", "ADMIN")
    .order("full_name");

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
