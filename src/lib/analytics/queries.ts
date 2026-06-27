import { createClient } from "@/lib/supabase/server";
import type {
  OverallTaskStats,
  SubsystemProgress,
  MemberWorkload,
  OverdueTask,
} from "./types";

// â”€â”€â”€ Overall Task Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getOverallTaskStats(): Promise<OverallTaskStats> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("tasks")
    .select("id, status, deadline");

  if (error) throw new Error(error.message);

  const tasks = data || [];
  const completed = tasks.filter((t) => t.status === "APPROVED").length;
  const active = tasks.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW"
  ).length;
  const overdue = tasks.filter(
    (t) =>
      t.deadline &&
      t.deadline < now &&
      t.status !== "APPROVED"
  ).length;

  return {
    total: tasks.length,
    completed,
    active,
    overdue,
  };
}

// â”€â”€â”€ Subsystem Progress â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getSubsystemProgress(): Promise<SubsystemProgress[]> {
  const supabase = await createClient();

  // Fetch all subsystems with their tasks via tasks.subsystem_id
  const { data: subsystems, error: subError } = await supabase
    .from("subsystems")
    .select("id, name, color")
    .order("name");

  if (subError) throw new Error(subError.message);

  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("id, status, subsystem_id");

  if (taskError) throw new Error(taskError.message);

  return (subsystems || []).map((sub) => {
    const subTasks = (tasks || []).filter((t) => t.subsystem_id === sub.id);
    const completed = subTasks.filter((t) => t.status === "APPROVED").length;
    const total = subTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      id: sub.id,
      name: sub.name,
      color: sub.color,
      total,
      completed,
      percentage,
    };
  });
}

// â”€â”€â”€ Member Workload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getMemberWorkload(): Promise<MemberWorkload[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: members, error: memberError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name");

  if (memberError) throw new Error(memberError.message);

  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("id, status, deadline, assigned_to");

  if (taskError) throw new Error(taskError.message);

  const result: MemberWorkload[] = (members || [])
    .map((member) => {
      const memberTasks = (tasks || []).filter(
        (t) => t.assigned_to === member.id
      );
      const assigned = memberTasks.length;
      const completed = memberTasks.filter(
        (t) => t.status === "APPROVED"
      ).length;
      const overdue = memberTasks.filter(
        (t) =>
          t.deadline &&
          t.deadline < now &&
          t.status !== "APPROVED"
      ).length;
      const completionRate =
        assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

      return { id: member.id, full_name: member.full_name, assigned, completed, overdue, completionRate };
    })
    .filter((m) => m.assigned > 0) // only members who have tasks
    .sort((a, b) => b.overdue - a.overdue); // sort overdue desc

  return result;
}

// â”€â”€â”€ Overdue Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getOverdueTasks(): Promise<OverdueTask[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `id, title, deadline, assigned_to,
       profiles:assigned_to ( id, full_name )`
    )
    .lt("deadline", now)
    .neq("status", "APPROVED")
    .not("deadline", "is", null)
    .order("deadline", { ascending: true });

  if (error) throw new Error(error.message);

  const nowMs = Date.now();

  return (data || []).map((task) => {
    const deadlineMs = new Date(task.deadline!).getTime();
    const daysOverdue = Math.floor((nowMs - deadlineMs) / (1000 * 60 * 60 * 24));
    const profile = Array.isArray(task.profiles) ? task.profiles[0] : task.profiles;

    return {
      id: task.id,
      title: task.title,
      deadline: task.deadline!,
      daysOverdue,
      assignee: profile?.full_name ?? null,
      assigneeId: profile?.id ?? null,
    };
  });
}
