import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type SubsystemStat = {
  name: string;
  progress: number;
  taskCount: number;
  avatars: { initials: string; name: string }[];
  extraCount: number;
};

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export async function getSubsystemStats(): Promise<SubsystemStat[]> {
  // Use adminClient for tasks/subsystems (RLS allows all authenticated users)
  // But use regular client for profiles (RLS restricts to self/board+)
  const anonClient = await createClient();

  // Fetch subsystems and tasks with admin client (safe — RLS allows all reads)
  const [{ data: subsystems }, { data: tasks }] = await Promise.all([
    adminClient.from("subsystems").select("id, name").order("name"),
    adminClient.from("tasks").select("id, status, subsystem_id").not("subsystem_id", "is", null),
  ]);

  // Fetch members with RLS-aware client (respects profiles_select_own_or_board)
  const { data: members } = await anonClient
    .from("profiles")
    .select("id, full_name, subsystem_id")
    .eq("is_active", true)
    .not("subsystem_id", "is", null);

  if (!subsystems) return [];

  const keyOrder: string[] = [
    "Structures",
    "Transmission",
    "Vehicle Dynamics",
    "Aerodynamics",
    "EPT (Electrical, Powertrain & Telemetry)",
    "Machine Learning",
    "Management",
  ];

  const tasksBySubsystem = new Map<string, { total: number; done: number }>();
  for (const task of tasks || []) {
    const sid = task.subsystem_id;
    if (!sid) continue;
    const entry = tasksBySubsystem.get(sid) || { total: 0, done: 0 };
    entry.total++;
    if (task.status === "APPROVED") entry.done++;
    tasksBySubsystem.set(sid, entry);
  }

  const membersBySubsystem = new Map<string, { initials: string; name: string }[]>();
  for (const member of members || []) {
    const sid = member.subsystem_id;
    if (!sid) continue;
    const list = membersBySubsystem.get(sid) || [];
    list.push({ initials: getInitials(member.full_name), name: member.full_name });
    membersBySubsystem.set(sid, list);
  }

  return subsystems
    .filter((sub) => keyOrder.includes(sub.name))
    .sort((a, b) => keyOrder.indexOf(a.name) - keyOrder.indexOf(b.name))
    .map((sub) => {
      const stats = tasksBySubsystem.get(sub.id) || { total: 0, done: 0 };
      const subsystemMembers = membersBySubsystem.get(sub.id) || [];
      const total = stats.total;
      const done = stats.done;
      const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        name: sub.name,
        progress: percentage,
        taskCount: total,
        avatars: subsystemMembers.slice(0, 3),
        extraCount: Math.max(0, subsystemMembers.length - 3),
      };
    });
}
