import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

type Props = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  due_date: string | null;
};

const statusVariant: Record<string, "outline" | "default" | "success"> = {
  NOT_STARTED: "outline",
  IN_PROGRESS: "default",
  COMPLETED: "success",
};

export function MilestoneCard({
  id,
  title,
  description,
  status,
  due_date,
}: Props) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Target className="size-3 text-moto-cyan/40" />
              <span className="text-xs font-medium text-foreground tracking-tight line-clamp-1">
                {title}
              </span>
            </div>
            {description && (
              <p className="text-[0.7rem] text-muted-foreground/70 line-clamp-1 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {status && (
            <Badge variant={statusVariant[status] ?? "outline"}>
              {status.replace("_", " ")}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {due_date && (
          <p className="text-sm text-muted-foreground">
            <span>Due:</span>{" "}
            <span className="moto-number">
              {format(new Date(due_date), "MMM dd, yyyy")}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
