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
      task_assignments (
        user_id,
        profile:user_id (
          id,
          full_name,
          avatar_url,
          subsystem_id,
          profile_subsystem:subsystem_id ( name )
        )
      )
    `)
    .eq("milestone_id", milestoneId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((task: any) => ({
    ...task,
    assignees: (task.task_assignments || []).map((ta: any) => ({
      id: ta.profile?.id,
      full_name: ta.profile?.full_name,
      avatar_url: ta.profile?.avatar_url ?? null,
      subsystem_name: ta.profile?.profile_subsystem?.name ?? null,
    })),
  }));
}
