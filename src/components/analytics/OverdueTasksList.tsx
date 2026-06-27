import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { OverdueTask } from "@/lib/analytics/types";

type Props = {
  tasks: OverdueTask[];
};

export function OverdueTasksList({ tasks }: Props) {
  return (
    <Card>
      <CardHeader className="border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold tracking-tight">
            Overdue Tasks
          </CardTitle>
          {tasks.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {tasks.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <AlertTriangle className="mb-3 size-5 text-zinc-600" />
            <p className="text-sm text-zinc-300">No overdue tasks</p>
            <p className="mt-1 text-xs text-zinc-500">
              All tasks are on schedule.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {tasks.map((task) => (
              <li key={task.id}>
                <Link
                  href={`/tasks/${task.id}`}
                  className="group flex items-center justify-between px-5 py-4 transition-colors hover:bg-zinc-800/30"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium text-zinc-200 group-hover:text-zinc-100">
                      {task.title}
                      <ExternalLink className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </p>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      {task.assignee && <span>{task.assignee}</span>}
                      <span>
                        Due {format(new Date(task.deadline), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <Badge variant="destructive" className="ml-4 shrink-0">
                    {task.daysOverdue}d
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
