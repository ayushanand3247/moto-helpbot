import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-profile";

export async function getTask(id: string) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) {
    return null;
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .select(`
      *,
      milestone:milestone_id (
        id,
        title,
        project_id,
        project:project_id (
          id,
          title
        )
      ),
      assigned_to_profile:assigned_to (
        id,
        full_name,
        avatar_url,
        email
      ),
      created_by_profile:created_by (
        id,
        full_name,
        avatar_url,
        email
      ),
      subsystem:subsystem_id (
        id,
        name,
        color,
        icon
      ),
      task_assignments (
        user_id,
        assigned_at,
        assigned_by,
        profile:user_id (
          id,
          full_name,
          avatar_url,
          email,
          subsystem_id,
          profile_subsystem:subsystem_id ( name )
        )
      ),
      task_updates (
        *,
        author:author_id (
          id,
          full_name,
          avatar_url,
          email
        ),
        attachments (
          id,
          file_name,
          file_url,
          file_type,
          file_size_bytes,
          created_at
        )
      )
    `)
    .eq("id", id)
    .order("created_at", {
      ascending: true,
      referencedTable: "task_updates"
    })
    .single();

  if (error || !task) {
    return null;
  }

  // Authorization check — allow if assigned via junction table OR primary assignee
  if (profile.role === "MEMBER") {
    const isPrimaryAssignee = task.assigned_to === profile.id;
    const isJunctionAssignee = (task.task_assignments || []).some(
      (ta: any) => ta.user_id === profile.id
    );
    if (!isPrimaryAssignee && !isJunctionAssignee) {
      return null;
    }
  }

  return task;
}
