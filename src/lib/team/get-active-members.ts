import { createClient } from "@/lib/supabase/server";

export async function getActiveMembers() {
  const supabase = await createClient();

  const { data, error } = await supabase
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
