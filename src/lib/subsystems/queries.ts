import { createClient } from "@/lib/supabase/server";
import { nameToSlug } from "./slug";
import type { SubsystemDetail, SubsystemMember, SubsystemTask } from "./types";

export { nameToSlug };

/** Find subsystem by slug (match on name) */
export async function getSubsystem(
  slug: string
): Promise<SubsystemDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subsystems")
    .select("id, name, color, icon");

  if (error) throw new Error(error.message);

  const match = (data || []).find((s) => nameToSlug(s.name) === slug);
  return match ?? null;
}

/** All subsystems (for sidebar / navigation) */
export async function getAllSubsystems(): Promise<SubsystemDetail[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subsystems")
    .select("id, name, color, icon")
    .order("name");

  if (error) throw new Error(error.message);
  return data || [];
}

/** Members belonging to a subsystem, with their active task count */
export async function getSubsystemMembers(
  subsystemId: string
): Promise<SubsystemMember[]> {
  const supabase = await createClient();

  const { data: members, error: memberError } = await supabase
    .from("profiles")
    .select("id, full_name, email, position, role")
    .eq("subsystem_id", subsystemId)
    .eq("is_active", true)
    .order("full_name");

  if (memberError) throw new Error(memberError.message);

  if (!members || members.length === 0) return [];

  const memberIds = members.map((m) => m.id);

  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("assigned_to")
    .in("assigned_to", memberIds)
    .neq("status", "APPROVED");

  if (taskError) throw new Error(taskError.message);

  return members.map((m) => ({
    id: m.id,
    full_name: m.full_name,
    email: m.email,
    position: m.position,
    role: m.role,
    assignedTaskCount: (tasks || []).filter((t) => t.assigned_to === m.id)
      .length,
  }));
}

/** Tasks belonging to a subsystem */
export async function getSubsystemTasks(
  subsystemId: string
): Promise<SubsystemTask[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `id, title, status, priority, deadline, subsystem_id,
       profiles:assigned_to ( id, full_name ),
       subsystems ( id, name )`
    )
    .eq("subsystem_id", subsystemId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    deadline: task.deadline,
    subsystem_id: task.subsystem_id,
    profiles: task.profiles as { id: string; full_name: string }[] | null,
    subsystems: task.subsystems as { id: string; name: string }[] | null,
  }));
}
