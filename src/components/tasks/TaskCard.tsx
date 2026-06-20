import { format } from "date-fns";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  id: string;
  title: string;
  status?: string | null;
  priority?: string | null;
  assignee?: string | null;
  deadline?: string | null;
  subsystem?: string | null;
};

const statusColors: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  IN_REVIEW: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  BLOCKED: "bg-red-100 text-red-800",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
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
      <Card className="h-full cursor-pointer transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-base">
            {title}
          </CardTitle>

          <div className="flex gap-1 flex-wrap">
            {status && (
              <Badge
                className={statusColors[status]}
                variant="secondary"
              >
                {status}
              </Badge>
            )}

            {priority && (
              <Badge
                className={priorityColors[priority]}
                variant="secondary"
              >
                {priority}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-2 text-xs">
          {assignee && (
            <p className="text-muted-foreground">
              <span className="font-semibold">
                Assigned to:
              </span>{" "}
              {assignee}
            </p>
          )}

          {subsystem && (
            <p className="text-muted-foreground">
              <span className="font-semibold">
                Subsystem:
              </span>{" "}
              {subsystem}
            </p>
          )}

          {deadline && (
            <p className="text-muted-foreground">
              <span className="font-semibold">
                Due:
              </span>{" "}
              {format(
                new Date(deadline),
                "MMM dd, yyyy"
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
