"use server";

import { getMutationClient } from "@/lib/supabase/server-mutation";
import { getProfile } from "@/lib/auth/get-profile";
import { canTransition, requiresComment } from "@/lib/tasks/status-machine";
import { Database } from "@/lib/database/database.types";
import { revalidatePath } from "next/cache";
import { isMember } from "@/lib/roles";

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
  const supabase = getMutationClient();
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

  // For MEMBER working on task — check junction table too
  if (isMember(profile.role) && task.assigned_to !== profile.id) {
    // Also check if user is in task_assignments
    const { data: assignments } = await supabase
      .from("task_assignments")
      .select("user_id")
      .eq("task_id", input.taskId)
      .eq("user_id", profile.id);

    if (!assignments || assignments.length === 0) {
      throw new Error("You can only update tasks assigned to you");
    }
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

    // Auto-complete project if all tasks are now done
    if (input.newStatus === "APPROVED") {
      const { data: milestone } = await supabase
        .from("milestones")
        .select("project_id")
        .eq("id", task.milestone_id)
        .single();

      if (milestone?.project_id) {
        const { data: projectMilestones } = await supabase
          .from("milestones")
          .select("id")
          .eq("project_id", milestone.project_id);

        const milestoneIds = (projectMilestones || []).map((m: any) => m.id);

        if (milestoneIds.length > 0) {
          const { data: projectTasks } = await supabase
            .from("tasks")
            .select("status")
            .in("milestone_id", milestoneIds);

          const allDone = projectTasks && projectTasks.length > 0 &&
            projectTasks.every((t: any) => t.status === "APPROVED");

          if (allDone) {
            await supabase
              .from("projects")
              .update({ status: "COMPLETED" })
              .eq("id", milestone.project_id);
          }
        }
      }
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

  // Get all assignees from junction table + primary assignee
  const allAssigneeIds = new Set<string>();
  if (task.assigned_to) allAssigneeIds.add(task.assigned_to);

  const { data: junctionAssignments } = await supabase
    .from("task_assignments")
    .select("user_id")
    .eq("task_id", input.taskId);

  if (junctionAssignments) {
    junctionAssignments.forEach((a: any) => allAssigneeIds.add(a.user_id));
  }

  if (input.updateType === "PROGRESS") {
    // Notify task creator and all assignees
    if (task.created_by && task.created_by !== profile.id) {
      notificationRecipients.push(task.created_by);
    }
    allAssigneeIds.forEach((id) => {
      if (id !== profile.id) notificationRecipients.push(id);
    });
  } else if (input.updateType === "STATUS_CHANGE" || input.newStatus === "IN_REVIEW") {
    // Notify leads + all assignees when task submitted for review
    const { data: boardMembers } = await supabase
      .from("profiles")
      .select("id")
      .in("role", ["ADMIN", "BOARD"]);

    if (boardMembers) {
      notificationRecipients.push(
        ...boardMembers
          .map((m) => m.id)
          .filter((id) => id !== profile.id)
      );
    }
    allAssigneeIds.forEach((id) => {
      if (id !== profile.id) notificationRecipients.push(id);
    });
  } else if (input.updateType === "APPROVAL") {
    // Notify all assignees
    allAssigneeIds.forEach((id) => {
      if (id !== profile.id) notificationRecipients.push(id);
    });
  } else if (input.updateType === "REJECTION") {
    // Notify all assignees
    allAssigneeIds.forEach((id) => {
      if (id !== profile.id) notificationRecipients.push(id);
    });
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
  revalidatePath("/projects");
  revalidatePath("/dashboard");

  return taskUpdate;
}

// ── createTask — new task from dashboard modal ────────────────
// Supports both legacy (subsystem name) and new (subsystem_id + assigned_to_ids) params

export async function createTask(data: {
  title: string;
  description?: string;
  subsystem?: string;
  subsystem_id?: string;
  assignee_id?: string;
  assigned_to_ids?: string[];
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  due_date?: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "APPROVED" | "BLOCKED";
}) {
  const supabase = getMutationClient();
  const profile = await getProfile();

  if (!profile) throw new Error("Unauthorized");

  // Resolve subsystem: prefer subsystem_id, fall back to name lookup
  let resolvedSubsystemId = data.subsystem_id || null;
  if (!resolvedSubsystemId && data.subsystem) {
    const { data: sub } = await supabase
      .from("subsystems")
      .select("id")
      .eq("name", data.subsystem)
      .maybeSingle();
    resolvedSubsystemId = sub?.id || null;
  }

  // Determine primary assignee (first in array or legacy single)
  const primaryAssignee = data.assigned_to_ids?.[0] || data.assignee_id || null;

  const { data: task, error } = await supabase.from("tasks").insert({
    title: data.title,
    description: data.description || null,
    subsystem_id: resolvedSubsystemId,
    assigned_to: primaryAssignee,
    priority: data.priority,
    deadline: data.due_date || null,
    status: data.status,
    created_by: profile.id,
    milestone_id: null,
  }).select().single();

  if (error) throw error;

  // Insert into task_assignments junction table
  if (data.assigned_to_ids && data.assigned_to_ids.length > 0) {
    const assignments = data.assigned_to_ids.map((userId) => ({
      task_id: task.id,
      user_id: userId,
      assigned_by: profile.id,
    }));

    await supabase.from("task_assignments").insert(assignments);

    // Notify all assigned users (except creator)
    const notificationRecipients = data.assigned_to_ids.filter(
      (id) => id !== profile.id
    );

    if (notificationRecipients.length > 0) {
      const notifications = notificationRecipients.map((recipientId) => ({
        recipient_id: recipientId,
        title: "New Task Assigned",
        body: data.title,
        type: "TASK_ASSIGNED",
        related_task_id: task.id,
      }));

      await supabase.from("notifications").insert(notifications);
    }
  } else if (data.assignee_id && data.assignee_id !== profile.id) {
    // Legacy single-assignee notification
    await supabase.from("notifications").insert({
      recipient_id: data.assignee_id,
      title: "New Task Assigned",
      body: data.title,
      type: "TASK_ASSIGNED",
      related_task_id: task.id,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/tasks");
}

// ── getTaskAssignees — for the multi-assignee selector ─────────
// Uses admin client because this is called from server actions
// where permission checks are handled at the action level.

export async function getTaskAssignees() {
  const supabase = getMutationClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, subsystem_id, subsystems ( name )")
    .eq("is_active", true)
    .order("full_name");

  if (error) return [];
  return (data || []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    avatar_url: p.avatar_url ?? null,
    subsystem_name: p.subsystems?.name ?? null,
  }));
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
