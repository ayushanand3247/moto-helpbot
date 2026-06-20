import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-profile";

type TaskFilter = {
  status?: string;
  priority?: string;
  subsystem_id?: string;
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
      profiles:assigned_to (
        id,
        full_name
      )
    `);

  // RLS: Apply role-based filtering
  if (profile.role === "MEMBER") {
    // Members can only see tasks assigned to them
    query = query.eq("assigned_to", profile.id);
  }
  // ADMIN and BOARD can see all tasks (RLS handles this server-side)

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

  const { data, error } = await query.order(
    "created_at",
    { ascending: false }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
