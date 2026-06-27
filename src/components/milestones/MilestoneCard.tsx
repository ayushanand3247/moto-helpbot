import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badges";

type Props = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  due_date: string | null;
};

export function MilestoneCard({ title, description, status, due_date }: Props) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/95">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 tracking-tight">{title}</CardTitle>
          <StatusBadge value={status ?? undefined} />
        </div>
        <CardDescription className="line-clamp-2 text-zinc-400">
          {description || "No description"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {due_date ? <p className="text-sm text-zinc-400">Due: {format(new Date(due_date), "MMM dd, yyyy")}</p> : null}
      </CardContent>
    </Card>
  );
}

