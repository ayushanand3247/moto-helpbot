"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { FolderKanban, Trash2, Check } from "lucide-react";

type Props = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  target_date: string | null;
  total_tasks: number;
  completed_tasks: number;
  onDelete?: () => void;
};

const statusVariant: Record<string, "default" | "success" | "secondary" | "outline"> = {
  PLANNING: "outline",
  ACTIVE: "success",
  COMPLETED: "secondary",
  ARCHIVED: "outline",
};

export function ProjectCard({
  id,
  title,
  description,
  status,
  target_date,
  total_tasks,
  completed_tasks,
  onDelete,
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();
  const percentage = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;
  const isCompleted = percentage === 100 && total_tasks > 0;

  return (
    <>
      <Card
        className="h-full cursor-pointer transition-all duration-200 hover:border-moto-cyan/30 hover:shadow-[0_2px_8px_oklch(0.45_0.10_220/0.1)]"
        onClick={() => router.push(`/projects/${id}`)}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="!text-xs !text-muted-foreground !normal-case !tracking-wider !font-semibold">
                <FolderKanban className="inline size-3 mr-1 -mt-0.5 text-moto-cyan/40" />
                Project
              </CardTitle>
              <p className="text-base font-semibold text-foreground tracking-tight mt-1 line-clamp-1">
                {title}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {isCompleted && (
                <Badge variant="success" className="gap-1">
                  <Check className="size-2.5" />
                  Completed
                </Badge>
              )}
              {!isCompleted && status && (
                <Badge variant={statusVariant[status] ?? "secondary"}>
                  {status}
                </Badge>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
                className="shrink-0 rounded-sm p-1 text-muted-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Delete project"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
          <CardDescription className="line-clamp-2 mt-1">
            {description || "No description"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">
                {total_tasks === 0
                  ? "No tasks yet"
                  : `${completed_tasks} / ${total_tasks} Tasks Completed`}
              </span>
              <span className="font-mono text-[10px] font-medium text-foreground/70">
                {percentage}%
              </span>
            </div>
            <ProgressBar percentage={percentage} />
          </div>

          {target_date && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Due:</span>
              <span className="moto-number">
                {format(new Date(target_date), "MMM dd, yyyy")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteProjectDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        projectId={id}
        projectTitle={title}
        onSuccess={onDelete}
      />
    </>
  );
}
