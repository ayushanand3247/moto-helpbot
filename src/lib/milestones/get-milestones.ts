import { createClient } from "@/lib/supabase/server";

export async function getMilestones(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("milestones")
    .select(`
      id,
      title,
      description,
      status,
      due_date,
      created_by,
      created_at,
      order_index
    `)
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
