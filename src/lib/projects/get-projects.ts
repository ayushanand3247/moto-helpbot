import { createClient } from "@/lib/supabase/server";

export async function getProjects() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(`
      id,
      title,
      description,
      status,
      start_date,
      target_date,
      created_by,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
