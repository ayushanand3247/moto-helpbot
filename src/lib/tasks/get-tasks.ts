import { createClient } from "@/lib/supabase/server";

export async function getTasks(milestoneId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      id,
      title,
      description,
      status,
      priority,
      assigned_to,
      deadline,
      estimated_hours,
      subsystem_id,
      subsystems (
        id,
        name
      ),
      profiles:assigned_to (
        id,
        full_name
      )
    `)
    .eq("milestone_id", milestoneId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
