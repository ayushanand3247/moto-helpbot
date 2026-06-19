import { createClient } from "@/lib/supabase/server";

export async function getTeamMembers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      role,
      position,
      is_active,
      subsystems (
        name
      )
    `)
    .order("full_name");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}