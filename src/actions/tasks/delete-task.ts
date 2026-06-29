"use server";

import { revalidatePath } from "next/cache";
import { getMutationClient } from "@/lib/supabase/server-mutation";
import { getProfile } from "@/lib/auth/get-profile";

/**
 * Delete a task and ALL its references:
 * - task_assignments (junction table)
 * - task_updates (and their attachments)
 * - attachments
 * - task_comments
 * - activity_logs
 * - notifications referencing the task
 * - the task itself
 *
 * Uses adminClient (service role) to bypass RLS — permission checks
 * are done explicitly in this function.
 *
 * Permissions: ADMIN can delete any task.
 * MEMBER can only delete tasks assigned to them (board+ can delete any).
 */
export async function deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  const profile = await getProfile();
  if (!profile) return { success: false, error: "Unauthorized" };

  // Use service role client to bypass RLS — permission checks are done explicitly
  const supabase = getMutationClient();

  // Fetch task to check permissions
  const { data: task } = await supabase
    .from("tasks")
    .select("id, assigned_to, milestone_id")
    .eq("id", taskId)
    .single();

  if (!task) return { success: false, error: "Task not found" };

  // Permission check:
  // ADMIN — can delete any task
  // MEMBER — can only delete tasks assigned to them
  // Board roles (TEAM_MANAGER, CAPTAIN, SUBSYSTEM_LEAD) — can delete any
  if (profile.role === "MEMBER") {
    const { data: assignments } = await supabase
      .from("task_assignments")
      .select("user_id")
      .eq("task_id", taskId)
      .eq("user_id", profile.id);

    const isPrimary = task.assigned_to === profile.id;
    const isJunction = (assignments || []).length > 0;

    if (!isPrimary && !isJunction) {
      return { success: false, error: "You can only delete tasks assigned to you" };
    }
  }

  // 0. Clear any tasks that depend on this one (self-referencing FK)
  await supabase
    .from("tasks")
    .update({ depends_on: null })
    .eq("depends_on", taskId);

  // 1. Fetch task update IDs (for attachment cleanup)
  const { data: taskUpdates } = await supabase
    .from("task_updates")
    .select("id")
    .eq("task_id", taskId);

  const updateIds = (taskUpdates || []).map((u: any) => u.id);

  // 2. Delete attachments linked to task updates
  if (updateIds.length > 0) {
    // Fetch attachment URLs from storage for cleanup
    const { data: attachments } = await supabase
      .from("attachments")
      .select("file_url")
      .in("update_id", updateIds);

    // Delete files from storage bucket
    const fileUrls = (attachments || [])
      .map((a: any) => a.file_url)
      .filter(Boolean);

    if (fileUrls.length > 0) {
      // Extract storage paths from URLs
      // URLs look like: https://xxx.supabase.co/storage/v1/object/public/attachments/user_id/file.pdf
      // or: /storage/v1/object/public/attachments/user_id/file.pdf
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

    // Delete attachment DB records
    await supabase.from("attachments").delete().in("update_id", updateIds);
  }

  // 3. Delete task comments
  await supabase.from("task_comments").delete().eq("task_id", taskId);

  // 4. Delete activity logs referencing this task (entity_type = 'task')
  await supabase.from("activity_logs").delete().eq("entity_id", taskId).eq("entity_type", "task");

  // 5. Delete notifications referencing this task
  await supabase.from("notifications").delete().eq("related_task_id", taskId);

  // 6. Delete task updates
  await supabase.from("task_updates").delete().eq("task_id", taskId);

  // 7. Delete task_assignments (junction table)
  await supabase.from("task_assignments").delete().eq("task_id", taskId);

  // 8. Finally, delete the task itself
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    return { success: false, error: error.message };
  }

  // 9. Check if parent milestone/project needs status update
  if (task.milestone_id) {
    const { data: milestone } = await supabase
      .from("milestones")
      .select("project_id")
      .eq("id", task.milestone_id)
      .single();

    if (milestone?.project_id) {
      // Recalculate project progress without the deleted task
      const { data: projectMilestones } = await supabase
        .from("milestones")
        .select("id")
        .eq("project_id", milestone.project_id);

      const milestoneIds = (projectMilestones || []).map((m: any) => m.id);

      if (milestoneIds.length > 0) {
        const { data: remainingTasks } = await supabase
          .from("tasks")
          .select("status")
          .in("milestone_id", milestoneIds);

        const total = remainingTasks?.length ?? 0;
        const completed = (remainingTasks || []).filter(
          (t: any) => t.status === "APPROVED"
        ).length;

        let newStatus: string;
        if (total === 0) {
          newStatus = "PLANNING"; // No tasks left — back to planning
        } else if (completed === total) {
          newStatus = "COMPLETED"; // All remaining tasks done
        } else {
          newStatus = "ACTIVE"; // Some tasks still pending
        }

        await supabase
          .from("projects")
          .update({ status: newStatus })
          .eq("id", milestone.project_id);
      }
    }
  }

  // 10. Revalidate all affected pages
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/tasks/${taskId}`);
  // Also revalidate the specific project page if we know which project
  if (task.milestone_id) {
    const { data: milestone } = await supabase
      .from("milestones")
      .select("project_id")
      .eq("id", task.milestone_id)
      .single();
    if (milestone?.project_id) {
      revalidatePath(`/projects/${milestone.project_id}`);
    }
  }

  return { success: true };
}
