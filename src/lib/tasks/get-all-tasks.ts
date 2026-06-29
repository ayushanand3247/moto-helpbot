import { adminClient } from "@/lib/supabase/admin";
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
  // Use admin client for faster queries (no RLS)
  const supabase = adminClient;

  // Profile needed for role-based filtering
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

  // RLS: Apply role-based filtering in code (since we're using admin client)
  if (profile.role === "MEMBER") {
    // Members see only tasks assigned to them
    const { data: assignments } = await supabase
      .from("task_assignments")
      .select("task_id")
      .eq("user_id", profile.id);

    const assignedTaskIds = (assignments || []).map((a: any) => a.task_id);

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

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error || !data) return [];

  return data;
}
