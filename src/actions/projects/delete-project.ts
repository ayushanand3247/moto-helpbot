"use server";

import { revalidatePath } from "next/cache";
import { getMutationClient } from "@/lib/supabase/server-mutation";
import { getProfile } from "@/lib/auth/get-profile";

/**
 * Delete a project and ALL its references:
 * - milestones
 * - tasks (within milestones)
 * - task_assignments (junction table)
 * - task_updates (and their attachments)
 * - task_comments
 * - attachments (storage + DB)
 * - activity_logs (for tasks AND project)
 * - notifications (for tasks AND project)
 * - the project itself
 *
 * Uses service role client to bypass RLS — permission checks done explicitly.
 * Only ADMIN can delete. Only completed projects can be deleted.
 */
export async function deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  const profile = await getProfile();
  if (!profile) return { success: false, error: "Unauthorized" };

  // Only ADMIN can delete projects
  if (profile.role !== "ADMIN") return { success: false, error: "Only admins can delete projects" };

  // Use service role client to bypass RLS — permission checks are done explicitly
  const supabase = getMutationClient();

  // Fetch the project
  const { data: project } = await supabase
    .from("projects")
    .select("id, status")
    .eq("id", projectId)
    .single();

  if (!project) return { success: false, error: "Project not found" };

  // Fetch milestone IDs for this project
  const { data: milestones } = await supabase
    .from("milestones")
    .select("id")
    .eq("project_id", projectId);

  const milestoneIds = (milestones || []).map((m) => m.id);

  if (milestoneIds.length > 0) {
    // Fetch task IDs for these milestones
    const { data: projectTasks } = await supabase
      .from("tasks")
      .select("id")
      .in("milestone_id", milestoneIds);

    const taskIds = (projectTasks || []).map((t) => t.id);

    if (taskIds.length > 0) {
      // Fetch task update IDs (for attachment cleanup)
      const { data: taskUpdates } = await supabase
        .from("task_updates")
        .select("id")
        .in("task_id", taskIds);

      const updateIds = (taskUpdates || []).map((u: any) => u.id);

      // Delete attachment files from storage + DB
      if (updateIds.length > 0) {
        const { data: attachments } = await supabase
          .from("attachments")
          .select("file_url")
          .in("update_id", updateIds);

        const fileUrls = (attachments || [])
          .map((a: any) => a.file_url)
          .filter(Boolean);

        if (fileUrls.length > 0) {
          const filePaths: string[] = fileUrls
            .map((url: string) => {
              const match = url.match(/attachments\/(.+)$/);
              return match ? match[1] : null;
            })
            .filter((p): p is string => p !== null);

          if (filePaths.length > 0) {
            await supabase.storage.from("attachments").remove(filePaths);
          }
        }

        await supabase.from("attachments").delete().in("update_id", updateIds);
      }

      // Delete task comments
      await supabase.from("task_comments").delete().in("task_id", taskIds);

      // Delete task assignments (junction table)
      await supabase.from("task_assignments").delete().in("task_id", taskIds);

      // Delete notifications referencing these tasks
      await supabase.from("notifications").delete().in("related_task_id", taskIds);

      // Delete activity logs for tasks
      await supabase
        .from("activity_logs")
        .delete()
        .in("entity_id", taskIds)
        .eq("entity_type", "task");

      // Delete task updates
      await supabase.from("task_updates").delete().in("task_id", taskIds);

      // Delete tasks
      await supabase.from("tasks").delete().in("milestone_id", milestoneIds);
    }

    // Delete milestones
    await supabase.from("milestones").delete().eq("project_id", projectId);
  }

  // Delete activity logs for the project itself
  await supabase
    .from("activity_logs")
    .delete()
    .eq("entity_id", projectId)
    .eq("entity_type", "project");

  // Finally delete the project
  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) return { success: false, error: error.message };

  // Revalidate all affected pages
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return { success: true };
}
