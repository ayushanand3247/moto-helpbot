import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime, formatActivityAction } from "@/lib/format-time";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getActivityFeed() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      `id, action, entity_type, entity_id, created_at,
       profiles:actor_id ( id, full_name )`
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function ActivityFeed() {
  const logs = await getActivityFeed();

  return (
    <Card>
      <CardHeader className="border-b border-zinc-800">
        <CardTitle className="text-base font-semibold tracking-tight">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {logs.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">
            No recent activity.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {logs.map((log) => {
              const actor = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
              const actorName = actor?.full_name ?? "Someone";
              const action = formatActivityAction(log.action);
              const time = formatRelativeTime(log.created_at);

              return (
                <li
                  key={log.id}
                  className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-zinc-800/30"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-zinc-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-zinc-200">{actorName}</span>{" "}
                      <span className="text-zinc-400">{action}</span>
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
