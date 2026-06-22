import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-profile";
import { notFound } from "next/navigation";

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

  // Authorization check
  if (profile.role === "MEMBER" && task.assigned_to !== profile.id) {
    return null;
  }

  return task;
}
