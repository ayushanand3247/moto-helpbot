import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge, StatusBadge } from "@/components/ui/badges";

type Props = {
  id: string;
  title: string;
  status?: string | null;
  priority?: string | null;
  assignee?: string | null;
  deadline?: string | null;
  subsystem?: string | null;
};

export function TaskCard({
  id,
  title,
  status,
  priority,
  assignee,
  deadline,
  subsystem,
}: Props) {
  return (
    <Link href={`/tasks/${id}`}>
      <Card className="h-full cursor-pointer transition-colors duration-150 hover:border-zinc-700">
        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-1 text-base">{title}</CardTitle>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <StatusBadge value={status ?? undefined} />
            <PriorityBadge value={priority ?? undefined} />
          </div>
        </CardHeader>

        <CardContent className="space-y-1.5 text-xs text-zinc-500">
          {assignee ? <p>Assigned to {assignee}</p> : null}
          {subsystem ? <p>{subsystem}</p> : null}
          {deadline ? (
            <p className="font-mono">
              Due {new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
