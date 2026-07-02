"use server";

import { getMutationClient } from "@/lib/supabase/server-mutation";
import { revalidatePath } from "next/cache";

export async function createTaskUpdate(data: {
  task_id: string;
  content?: string | null;
  attachments?: Array<{
    file_name: string;
    file_url: string;
    file_type?: string | null;
    file_size_bytes?: number | null;
  }>;
}) {
  const supabase = getMutationClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  // Fetch the task to verify user has access
  const { data: task } = await supabase
    .from("tasks")
    .select("id, assigned_to")
    .eq("id", data.task_id)
    .single();

  if (!task) {
    return { success: false, message: "Task not found" };
  }

  // Check if user is assigned to this task (primary or via junction)
  const isPrimary = task.assigned_to === user.id;
  const { data: assignments } = await supabase
    .from("task_assignments")
    .select("user_id")
    .eq("task_id", data.task_id)
    .eq("user_id", user.id);

  if (!isPrimary && (!assignments || assignments.length === 0)) {
    // Check if user is BOARD+ (can update any task)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "ADMIN" && profile.role !== "BOARD")) {
      return { success: false, message: "Unauthorized — not assigned to this task" };
    }
  }

  // Insert task update
  const { data: updateData, error: updateError } = await supabase
    .from("task_updates")
    .insert([
      {
        task_id: data.task_id,
        content: data.content || null,
        author_id: user.id,
      },
    ])
    .select("id")
    .single();

  if (updateError || !updateData) {
    return { success: false, message: updateError?.message || "Failed to create update" };
  }

  const updateId = updateData.id as string;

  if (data.attachments && data.attachments.length > 0) {
    const attachmentsToInsert = data.attachments.map((a) => ({
      file_name: a.file_name,
      file_url: a.file_url,
      file_type: a.file_type || null,
      file_size_bytes: a.file_size_bytes || null,
      update_id: updateId,
      uploaded_by: user.id,
    }));

    const { error: attachError } = await supabase.from("attachments").insert(attachmentsToInsert);

    if (attachError) {
      return { success: false, message: attachError.message };
    }

    // Log activity for each attachment
    for (const a of attachmentsToInsert) {
      await supabase.from("activity_logs").insert([
        {
          action: "ATTACHMENT_UPLOADED",
          actor_id: user.id,
          entity_type: "task",
          entity_id: data.task_id,
          metadata: { filename: a.file_name },
        },
      ]);
    }
  }

  revalidatePath(`/tasks/${data.task_id}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");

  return { success: true, update_id: updateId };
}
