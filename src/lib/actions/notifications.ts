import { adminClient } from "@/lib/supabase/admin";

export type Notification = {
  id: string;
  actor: string;
  name: string;
  action: string;
  subsystem: string;
  time: string;
};

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export async function getRecentNotifications(
  limit = 10
): Promise<Notification[]> {
  const supabase = adminClient;

  // Derive from recently updated tasks (last 48h)
  const twoDaysAgo = new Date(Date.now() - 48 * 3600000).toISOString();

  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      updated_at,
      subsystems ( name ),
      task_assignments (
        profile:user_id ( full_name )
      ),
      profiles!tasks_assigned_to_fkey ( full_name )
    `
    )
    .gte("updated_at", twoDaysAgo)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (!tasks) return [];

  return tasks.map((t: any) => ({
    id: t.id,
    actor: t.profiles?.full_name ? getInitials(t.profiles.full_name) : "—",
    name: t.profiles?.full_name ?? "Unknown",
    action: `updated "${t.title}"`,
    subsystem: t.subsystems?.name ?? "—",
    time: t.updated_at ? timeAgo(t.updated_at) : "—",
  }));
}
