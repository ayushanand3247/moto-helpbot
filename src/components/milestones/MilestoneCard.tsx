import { format } from "date-fns";
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
  description: string | null;
  status: string | null;
  due_date: string | null;
};

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
};

export function MilestoneCard({
  id,
  title,
  description,
  status,
  due_date,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">
              {title}
            </CardTitle>
          </div>
          {status && (
            <Badge
              className={statusColors[status]}
            >
              {status.replace("_", " ")}
            </Badge>
          )}
        </div>
        <CardDescription
          className="line-clamp-2"
        >
          {description || "No description"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {due_date && (
          <p className="text-sm text-muted-foreground">
            Due:{" "}
            {format(
              new Date(due_date),
              "MMM dd, yyyy"
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
