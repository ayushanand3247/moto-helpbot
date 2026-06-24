"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-profile";
import { canTransition, requiresComment } from "@/lib/tasks/status-machine";
import { Database } from "@/lib/database/database.types";
import { revalidatePath } from "next/cache";

type TaskStatus = Database["public"]["Enums"]["task_status"];
type UpdateType = Database["public"]["Enums"]["update_type"];

interface SubmitUpdateInput {
  taskId: string;
  content?: string | null;
  updateType: UpdateType;
  newStatus?: TaskStatus;
  attachments?: Array<{
    file_name: string;
    file_url: string;
    file_type?: string | null;
    file_size_bytes?: number | null;
  }>;
}

export async function submitUpdate(input: SubmitUpdateInput) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) {
    throw new Error("Unauthorized");
  }

  // Get current task
  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", input.taskId)
    .single();

  if (!task) {
    throw new Error("Task not found");
  }

  // Validate status transition if applicable
  if (input.newStatus && input.newStatus !== task.status) {
    if (!canTransition(task.status, input.newStatus, profile.role)) {
      throw new Error(
        `Cannot transition from ${task.status} to ${input.newStatus} with role ${profile.role}`
      );
    }

    if (requiresComment(task.status, input.newStatus) && !input.content) {
      throw new Error(
        "A comment is required for this status transition"
      );
    }
  }

  // For MEMBER working on task
  if (profile.role === "MEMBER" && task.assigned_to !== profile.id) {
    throw new Error("You can only update tasks assigned to you");
  }

  // Create task update
  const { data: taskUpdate, error: updateError } = await supabase
    .from("task_updates")
    .insert({
      task_id: input.taskId,
      author_id: profile.id,
      content: input.content || null,
      update_type: input.updateType,
      old_status: task.status,
      new_status: input.newStatus || null,
    })
    .select()
    .single();

  if (updateError || !taskUpdate) {
    throw new Error(updateError?.message || "Failed to create update");
  }

  // Update task status if transitioning
  if (input.newStatus && input.newStatus !== task.status) {
    const { error: statusError } = await supabase
      .from("tasks")
      .update({
        status: input.newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.taskId);

    if (statusError) {
      throw new Error(statusError.message);
    }
  }

  if (input.attachments && input.attachments.length > 0) {
    const attachmentsToInsert = input.attachments.map((attachment) => ({
      file_name: attachment.file_name,
      file_url: attachment.file_url,
      file_type: attachment.file_type || null,
      file_size_bytes: attachment.file_size_bytes || null,
      update_id: taskUpdate.id,
      uploaded_by: profile.id,
    }));

    const { error: attachmentsError } = await supabase
      .from("attachments")
      .insert(attachmentsToInsert);

    if (attachmentsError) {
      throw new Error(attachmentsError.message);
    }
  }

  // Create activity log
  let activityAction = "PROGRESS_SUBMITTED";
  if (input.updateType === "COMMENT") {
    activityAction = "COMMENT_ADDED";
  } else if (input.updateType === "STATUS_CHANGE") {
    activityAction = "STATUS_CHANGED";
  } else if (input.updateType === "APPROVAL") {
    activityAction = "TASK_APPROVED";
  } else if (input.updateType === "REJECTION") {
    activityAction = "CHANGES_REQUESTED";
  }

  await supabase.from("activity_logs").insert({
    action: activityAction,
    actor_id: profile.id,
    entity_type: "TASK",
    entity_id: input.taskId,
    metadata: {
      updateType: input.updateType,
      oldStatus: task.status,
      newStatus: input.newStatus,
    },
  });

  // Create notifications
  const notificationRecipients: string[] = [];

  if (input.updateType === "PROGRESS") {
    // Notify task creator and board members
    if (task.created_by && task.created_by !== profile.id) {
      notificationRecipients.push(task.created_by);
    }
  } else if (input.updateType === "STATUS_CHANGE" || input.newStatus === "IN_REVIEW") {
    // Notify board members when task submitted for review
    const { data: boardMembers } = await supabase
      .from("profiles")
      .select("id")
      .in("role", ["BOARD", "ADMIN"]);

    if (boardMembers) {
      notificationRecipients.push(
        ...boardMembers
          .map((m) => m.id)
          .filter((id) => id !== profile.id)
      );
    }
  } else if (input.updateType === "APPROVAL") {
    // Notify assigned member
    if (task.assigned_to && task.assigned_to !== profile.id) {
      notificationRecipients.push(task.assigned_to);
    }
  } else if (input.updateType === "REJECTION") {
    // Notify assigned member
    if (task.assigned_to && task.assigned_to !== profile.id) {
      notificationRecipients.push(task.assigned_to);
    }
  }

  // Insert unique notifications
  const uniqueRecipients = Array.from(new Set(notificationRecipients));
  if (uniqueRecipients.length > 0) {
    const notifications = uniqueRecipients.map((recipientId) => ({
      recipient_id: recipientId,
      related_task_id: input.taskId,
      title: getNotificationTitle(
        input.updateType,
        profile.full_name,
        task.title
      ),
      body: input.content || null,
      type: input.updateType.toLowerCase(),
    }));

    await supabase.from("notifications").insert(notifications);
  }

  revalidatePath(`/tasks/${input.taskId}`);

  return taskUpdate;
}

function getNotificationTitle(
  updateType: UpdateType,
  authorName: string,
  taskTitle: string
): string {
  switch (updateType) {
    case "PROGRESS":
      return `${authorName} submitted progress on "${taskTitle}"`;
    case "COMMENT":
      return `${authorName} commented on "${taskTitle}"`;
    case "STATUS_CHANGE":
      return `Task "${taskTitle}" status updated`;
    case "APPROVAL":
      return `Task "${taskTitle}" approved`;
    case "REJECTION":
      return `Changes requested on "${taskTitle}"`;
    default:
      return `Update on "${taskTitle}"`;
  }
}
