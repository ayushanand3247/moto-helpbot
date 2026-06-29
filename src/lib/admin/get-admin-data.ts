import { createClient } from "@/lib/supabase/server";

export async function getAdminUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(`id, full_name, email, role, is_active, position, subsystem_id, joined_year, created_at, subsystems ( id, name )`)
    .order("full_name");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAdminInvitations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invitations")
    .select(`id, email, full_name, role, token, expires_at, created_at, accepted_at, subsystem_id, subsystems ( id, name )`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAdminSubsystems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subsystems")
    .select(`id, name, icon, color, created_at, profiles ( id )`)
    .order("name");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAdminProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(`id, title, description, status, start_date, target_date, created_by, created_at, subsystems ( id, name ), profiles!projects_created_by_fkey ( id, full_name ), milestones ( tasks ( status ) )`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data || []).map((p: any) => {
    const tasks: { status: string | null }[] = p.milestones?.flatMap((m: any) => m.tasks || []) || [];
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      start_date: p.start_date,
      target_date: p.target_date,
      created_by: p.created_by,
      created_at: p.created_at,
      subsystem: p.subsystems,
      creator: p.profiles,
      total_tasks: tasks.length,
      completed_tasks: tasks.filter((t) => t.status === "APPROVED").length,
    };
  });
}

export async function getAnalytics() {
  const supabase = await createClient();

  const [
    { count: totalMembers },
    { count: activeMembers },
    { count: totalProjects },
    { count: activeProjects },
    { count: completedProjects },
    { count: totalTasks },
    { count: completedTasks },
    { count: overdueTasks },
    { count: totalFiles },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "ACTIVE"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "COMPLETED"),
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "APPROVED"),
    supabase.from("tasks").select("*", { count: "exact", head: true }).lt("deadline", new Date().toISOString()).neq("status", "APPROVED"),
    supabase.from("attachments").select("*", { count: "exact", head: true }),
  ]);

  const completionRate = totalTasks && totalTasks > 0
    ? Math.round(((completedTasks ?? 0) / totalTasks) * 100)
    : 0;

  return {
    totalMembers: totalMembers ?? 0,
    activeMembers: activeMembers ?? 0,
    totalProjects: totalProjects ?? 0,
    activeProjects: activeProjects ?? 0,
    completedProjects: completedProjects ?? 0,
    totalTasks: totalTasks ?? 0,
    completedTasks: completedTasks ?? 0,
    overdueTasks: overdueTasks ?? 0,
    completionRate,
    totalFiles: totalFiles ?? 0,
  };
}

export async function getAuditLogs(limit = 100) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select(`id, action, entity_type, entity_id, created_at, metadata, profiles ( id, full_name )`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}
