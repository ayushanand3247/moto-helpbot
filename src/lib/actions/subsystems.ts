import { createClient } from "@/lib/supabase/server";
import type { SubsystemKey } from "@/components/ui/SubsystemCard";

type SubsystemStat = {
  name: SubsystemKey;
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
  const supabase = await createClient();

  // Get all subsystems
  const { data: subsystems, error: subError } = await supabase
    .from("subsystems")
    .select("id, name")
    .order("name");

  if (subError || !subsystems) return [];

  // Get all tasks with subsystem info
  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("id, status, subsystem_id")
    .not("subsystem_id", "is", null);

  if (taskError) return [];

  // Get active members per subsystem
  const { data: members, error: memberError } = await supabase
    .from("profiles")
    .select("id, full_name, subsystem_id")
    .eq("is_active", true)
    .not("subsystem_id", "is", null);

  if (memberError) return [];

  // Standardized subsystem order — matches DB subsystem names exactly
  const keyOrder: SubsystemKey[] = [
    "Structures",
    "Transmission",
    "Vehicle Dynamics",
    "Aerodynamics",
    "EPT (Electrical, Powertrain & Telemetry)",
    "Machine Learning",
    "Management",
  ];

  // Group by SubsystemKey using exact DB name matching
  const grouped: Record<string, { total: number; completed: number }> = {};
  for (const key of keyOrder) {
    grouped[key] = { total: 0, completed: 0 };
  }

  for (const task of tasks) {
    const sub = subsystems.find((s) => s.id === task.subsystem_id);
    if (!sub) continue;
    const key = keyOrder.find((k) => k === sub.name);
    if (!key) continue;
    grouped[key].total++;
    if (task.status === "APPROVED") {
      grouped[key].completed++;
    }
  }

  // Group members by SubsystemKey
  const memberGrouped: Record<string, { initials: string; name: string }[]> = {};
  for (const key of keyOrder) {
    memberGrouped[key] = [];
  }

  for (const member of members) {
    const sub = subsystems.find((s) => s.id === member.subsystem_id);
    if (!sub) continue;
    const key = keyOrder.find((k) => k === sub.name);
    if (!key) continue;
    memberGrouped[key].push({
      initials: getInitials(member.full_name),
      name: member.full_name,
    });
  }

  return keyOrder
    .map((key) => {
      const stat = grouped[key] ?? { total: 0, completed: 0 };
      const allMembers = memberGrouped[key] ?? [];
      const shown = allMembers.slice(0, 4);
      const extra = allMembers.length - shown.length;

      return {
        name: key,
        progress:
          stat.total > 0
            ? Math.round((stat.completed / stat.total) * 100)
            : 0,
        taskCount: stat.total,
        avatars: shown,
        extraCount: extra,
      };
    })
    .filter((s) => s.taskCount > 0 || s.avatars.length > 0);
}
