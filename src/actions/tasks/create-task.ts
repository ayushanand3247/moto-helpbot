"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";

type CreateTaskInput = {
  milestoneId: string;
  projectId: string;
  title: string;
  description?: string;
  subsystem_id?: string;
  assigned_to?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  deadline?: string;
  estimated_hours?: number;
};

export async function createTask(
  input: CreateTaskInput
) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Title is required");
  }

  const supabase = await createClient();

  // Create the task
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      milestone_id: input.milestoneId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      subsystem_id: input.subsystem_id || null,
      assigned_to: input.assigned_to || null,
      priority: input.priority || "MEDIUM",
      deadline: input.deadline || null,
      estimated_hours: input.estimated_hours || null,
      status: "TODO",
      created_by: user.id,
    })
    .select()
    .single();

  if (taskError) {
    throw new Error(taskError.message);
  }

  // Create task update entry
  const { error: updateError } = await supabase
    .from("task_updates")
    .insert({
      task_id: task.id,
      author_id: user.id,
      update_type: "STATUS_CHANGE",
      old_status: null,
      new_status: "TODO",
      content: "Task created and assigned",
    });

  if (updateError) {
    console.error("Failed to create task update:", updateError);
  }

  // Create notification if task is assigned
  if (input.assigned_to) {
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        recipient_id: input.assigned_to,
        title: "New Task Assigned",
        body: input.title.trim(),
        type: "TASK_ASSIGNED",
        related_task_id: task.id,
      });

    if (notificationError) {
      console.error(
        "Failed to create notification:",
        notificationError
      );
    }
  }

  revalidatePath(`/projects/${input.projectId}`);

  return task;
}
