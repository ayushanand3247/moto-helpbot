import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-profile";

type TaskFilter = {
  status?: string;
  priority?: string;
  subsystem_id?: string;
  assigned_to_user_id?: string;
  assigned_to_me?: boolean;
  unassigned?: boolean;
};

export async function getAllTasks(
  filters?: TaskFilter
) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) {
    return [];
  }

  let query = supabase
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
      milestone_id,
      created_at,
      milestones (
        id,
        title,
        project_id
      ),
      subsystems (
        id,
        name
      ),
      task_assignments (
        user_id,
        assigned_by,
        profile:user_id (
          id,
          full_name,
          avatar_url
        )
      )
    `);

  // RLS: Apply role-based filtering
  let assignedTaskIds: string[] | null = null;
  if (profile.role === "MEMBER") {
    // Members see tasks they're assigned to via junction table OR primary assignee
    // First, get task IDs where the user is in the junction table
    const { data: assignments } = await supabase
      .from("task_assignments")
      .select("task_id")
      .eq("user_id", profile.id);

    assignedTaskIds = (assignments || []).map((a: any) => a.task_id);

    // Filter: assigned_to matches OR task ID is in the user's assignments
    if (assignedTaskIds.length > 0) {
      query = query.or(
        `assigned_to.eq.${profile.id},id.in.(${assignedTaskIds.join(",")})`
      );
    } else {
      query = query.eq("assigned_to", profile.id);
    }
  }

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }

  if (filters?.subsystem_id) {
    query = query.eq("subsystem_id", filters.subsystem_id);
  }

  if (filters?.assigned_to_user_id) {
    query = query.contains("task_assignments", [{ user_id: filters.assigned_to_user_id }]);
  }

  const { data, error } = await query.order(
    "created_at",
    { ascending: false }
  );

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((task: any) => ({
    ...task,
    assignees: (task.task_assignments || []).map((ta: any) => ({
      id: ta.profile?.id,
      full_name: ta.profile?.full_name,
      avatar_url: ta.profile?.avatar_url ?? null,
    })),
  }));
}
