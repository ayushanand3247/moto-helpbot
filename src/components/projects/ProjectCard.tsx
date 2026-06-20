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
  description: string | null;
  status: string | null;
  target_date: string | null;
};

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-800",
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  ARCHIVED: "bg-gray-200 text-gray-600",
};

export function ProjectCard({
  id,
  title,
  description,
  status,
  target_date,
}: Props) {
  return (
    <Link href={`/projects/${id}`}>
      <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
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
                {status}
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
          {target_date && (
            <p className="text-sm text-muted-foreground">
              Due:{" "}
              {format(
                new Date(target_date),
                "MMM dd, yyyy"
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
