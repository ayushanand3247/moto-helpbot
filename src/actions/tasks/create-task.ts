"use server";

import { revalidatePath } from "next/cache";
import { getMutationClient } from "@/lib/supabase/server-mutation";
import { getProfile } from "@/lib/auth/get-profile";

type CreateTaskInput = {
  milestoneId: string;
  projectId: string;
  title: string;
  description?: string;
  subsystem_id?: string;
  assigned_to_ids?: string[];
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  deadline?: string;
  estimated_hours?: number;
};

export async function createTask(
  input: CreateTaskInput
) {
  const profile = await getProfile();

  if (!profile) {
    throw new Error("Unauthorized");
  }

  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Title is required");
  }

  const supabase = getMutationClient();

  // Create the task (don't set assigned_to — use junction table instead)
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      milestone_id: input.milestoneId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      subsystem_id: input.subsystem_id || null,
      assigned_to: input.assigned_to_ids?.[0] || null, // Keep primary assignee for backward compat
      priority: input.priority || "MEDIUM",
      deadline: input.deadline || null,
      estimated_hours: input.estimated_hours || null,
      status: "TODO",
      created_by: profile.id,
    })
    .select()
    .single();

  if (taskError) {
    throw new Error(taskError.message);
  }

  // Insert into task_assignments junction table for all assignees
  if (input.assigned_to_ids && input.assigned_to_ids.length > 0) {
    const assignments = input.assigned_to_ids.map((userId) => ({
      task_id: task.id,
      user_id: userId,
      assigned_by: profile.id,
    }));

    const { error: assignmentError } = await supabase
      .from("task_assignments")
      .insert(assignments);

    if (assignmentError) {
      console.error("Failed to create task assignments:", assignmentError);
    }

    // Create notifications for all assigned users (except creator)
    const notificationRecipients = input.assigned_to_ids.filter(
      (id) => id !== profile.id
    );

    if (notificationRecipients.length > 0) {
      const notifications = notificationRecipients.map((recipientId) => ({
        recipient_id: recipientId,
        title: "New Task Assigned",
        body: input.title.trim(),
        type: "TASK_ASSIGNED",
        related_task_id: task.id,
      }));

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notificationError) {
        console.error("Failed to create notifications:", notificationError);
      }
    }
  }

  // Create task update entry
  const { error: updateError } = await supabase
    .from("task_updates")
    .insert({
      task_id: task.id,
      author_id: profile.id,
      update_type: "STATUS_CHANGE",
      old_status: null,
      new_status: "TODO",
      content: "Task created",
    });

  if (updateError) {
    console.error("Failed to create task update:", updateError);
  }

  // Create activity log
  await supabase.from("activity_logs").insert({
    action: "TASK_CREATED",
    actor_id: profile.id,
    entity_type: "TASK",
    entity_id: task.id,
    metadata: {
      title: input.title,
      assigned_count: input.assigned_to_ids?.length ?? 0,
    },
  });

  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return task;
}
