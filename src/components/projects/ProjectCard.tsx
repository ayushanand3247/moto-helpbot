import { format } from "date-fns";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badges";

type Props = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  target_date: string | null;
};

export function ProjectCard({ id, title, description, status, target_date }: Props) {
  return (
    <Link href={`/projects/${id}`}>
      <Card className="h-full cursor-pointer transition-colors duration-150 hover:border-zinc-700">
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
          {target_date ? <p className="text-sm text-zinc-400">Due: {format(new Date(target_date), "MMM dd, yyyy")}</p> : null}
        </CardContent>
      </Card>
    </Link>
  );
}

