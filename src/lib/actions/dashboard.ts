"use server";

import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/auth/get-profile";
import { isMember } from "@/lib/roles";
import { revalidatePath } from "next/cache";

// ── Types matching the TaskTable component ──────────────────────
export type TaskStatus = "To Do" | "In Progress" | "In Review" | "Done";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export type DashboardTask = {
  id: string;
  title: string;
  description?: string;
  subsystem: string;
  assignee: { name: string; initials: string };
  priority: Priority;
  dueDate: string;
  status: TaskStatus;
};

// ── DB → UI mappers ──────────────────────────────────────────────

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

const DB_TO_UI_STATUS: Record<string, TaskStatus> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  APPROVED: "Done",
  BLOCKED: "In Review",
};

const DB_TO_UI_PRIORITY: Record<string, Priority> = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "HIGH",
};

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

// ── Use adminClient for reads (faster, no cookie parsing) ──
// Safe for: tasks, projects, subsystems (RLS allows all authenticated users)
// NOT safe for: profiles, notifications, activity_logs, invitations (RLS restricts)
function getClient() {
  return adminClient;
}

// ── getTasks — for the dashboard table ───────────────────────────

type GetTasksOptions = {
  subsystem?: string;
  limit?: number;
};

export async function getTasks(
  options: GetTasksOptions = {}
): Promise<DashboardTask[]> {
  const supabase = getClient();

  let query = supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      description,
      status,
      priority,
      deadline,
      subsystem_id,
      assigned_to,
      subsystems ( name ),
      profiles!tasks_assigned_to_fkey ( full_name ),
      task_assignments (
        user_id,
        profile:user_id ( full_name )
      )
    `
    )
    .order("deadline", { ascending: true });

  if (options.subsystem) {
    query = query.eq("subsystem_id", options.subsystem);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row: any) => {
    const ymd = row.deadline
      ? new Date(row.deadline).toISOString().slice(0, 10)
      : "";
    const primaryAssignee = row.task_assignments?.[0]?.profile?.full_name
      || row.profiles?.full_name
      || "Unassigned";
    return {
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      subsystem: row.subsystems?.name ?? "Unassigned",
      assignee: {
        name: primaryAssignee,
        initials: primaryAssignee !== "Unassigned"
          ? getInitials(primaryAssignee)
          : "—",
      },
      priority: DB_TO_UI_PRIORITY[row.priority ?? "MEDIUM"],
      dueDate: formatDueDate(row.deadline),
      status: DB_TO_UI_STATUS[row.status ?? "TODO"],
      _dueYMD: ymd,
    };
  });
}

// ── updateTaskStatus — server action ─────────────────────────────

const UI_TO_DB_STATUS: Record<TaskStatus, string> = {
  "To Do": "TODO",
  "In Progress": "IN_PROGRESS",
  "In Review": "IN_REVIEW",
  "Done": "APPROVED",
};

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = getClient();
  const profile = await getProfile();

  if (!profile) {
    return { success: false, error: "Unauthorized" };
  }

  if (isMember(profile)) {
    const { data: task } = await supabase
      .from("tasks")
      .select("assigned_to, task_assignments ( user_id )")
      .eq("id", taskId)
      .single();

    const isPrimary = task?.assigned_to === profile.id;
    const isJunction = (task?.task_assignments || []).some(
      (ta: any) => ta.user_id === profile.id
    );

    if (!task || (!isPrimary && !isJunction)) {
      return {
        success: false,
        error: "You can only update tasks assigned to you",
      };
    }
  }

  const dbStatus = UI_TO_DB_STATUS[status];

  const { error } = await supabase
    .from("tasks")
    .update({ status: dbStatus })
    .eq("id", taskId);

  if (error) {
    return { success: false, error: error.message };
  }

  if (dbStatus === "APPROVED") {
    const { data: updatedTask } = await supabase
      .from("tasks")
      .select("milestone_id")
      .eq("id", taskId)
      .single();

    if (updatedTask?.milestone_id) {
      const { data: milestone } = await supabase
        .from("milestones")
        .select("project_id")
        .eq("id", updatedTask.milestone_id)
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

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/tasks");
  return { success: true };
}

// ── Upcoming deadlines ────────────────────────────────────────────

export type Deadline = {
  date: string;
  title: string;
  subsystem: string;
  priority: string;
};

export async function getUpcomingDeadlines(
  limit = 5
): Promise<Deadline[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      title,
      deadline,
      priority,
      subsystems ( name )
    `
    )
    .not("deadline", "is", null)
    .not("status", "eq", "APPROVED")
    .order("deadline", { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row: any) => {
    const d = row.deadline ? new Date(row.deadline) : null;
    const dateStr = d
      ? d.toLocaleDateString("en-GB", {
          month: "short",
          day: "2-digit",
        }).toUpperCase()
      : "—";

    return {
      date: dateStr,
      title: row.title,
      subsystem: row.subsystems?.name ?? "—",
      priority: row.priority ?? "LOW",
    };
  });
}

// ── Recent activity ──────────────────────────────────────────────

export type ActivityItem = {
  actor: string;
  name: string;
  action: string;
  subsystem: string;
  time: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export async function getRecentActivity(
  limit = 4
): Promise<ActivityItem[]> {
  const supabase = adminClient;

  const { data: logs, error: logError } = await supabase
    .from("activity_logs")
    .select(
      `
      action,
      created_at,
      entity_type,
      actor_id,
      profiles ( full_name )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (logError || !logs) return [];

  return logs.map((log: any) => ({
    actor: log.profiles?.full_name ?? "System",
    name: log.action,
    action: log.action,
    subsystem: "—",
    time: timeAgo(log.created_at),
  }));
}

// ── Dashboard stats ──────────────────────────────────────────────

export type DashboardStat = {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
};

export async function getDashboardStats(): Promise<DashboardStat[]> {
  const supabase = getClient();
  // Use regular client for profiles to respect RLS (members only see own profile)
  const anonClient = await createClient();

  const [{ count: total }, { count: done }, { count: inProgress }, { count: team }] = await Promise.all([
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "APPROVED"),
    supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "IN_PROGRESS"),
    anonClient.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return [
    { label: "Total Tasks",     value: `${total ?? 0}`,  sub: "All tasks" },
    { label: "Completed",       value: `${done ?? 0}`,   sub: "Approved" },
    { label: "In Progress",     value: `${inProgress ?? 0}`, sub: "Active" },
    { label: "Team Members",    value: `${team ?? 0}`,   sub: "Active" },
  ];
}
