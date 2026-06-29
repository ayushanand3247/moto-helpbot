"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateTaskStatus } from "@/lib/actions/dashboard";
import { deleteTask } from "@/actions/tasks/delete-task";

type Props = {
  id: string;
  title: string;
  status?: string | null;
  priority?: string | null;
  assignee?: string | null;
  assignees?: Array<{ id: string; full_name: string; avatar_url?: string | null }>;
  deadline?: string | null;
  subsystem?: string | null;
  onDelete?: () => void;
};

const statusVariant: Record<string, "secondary" | "default" | "warning" | "success" | "destructive"> = {
  TODO: "secondary",
  IN_PROGRESS: "default",
  IN_REVIEW: "warning",
  APPROVED: "success",
  BLOCKED: "destructive",
};

const priorityVariant: Record<string, "ghost" | "secondary" | "warning" | "destructive"> = {
  LOW: "ghost",
  MEDIUM: "secondary",
  HIGH: "warning",
  CRITICAL: "destructive",
};

export function TaskCard({
  id,
  title,
  status,
  priority,
  assignee,
  assignees,
  deadline,
  subsystem,
  onDelete,
}: Props) {
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDone = status === "APPROVED";

  const handleComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDone || completing) return;
    setCompleting(true);
    setError(null);
    const res = await updateTaskStatus(id, "Done");
    setCompleting(false);
    if (!res.success) {
      setError(res.error ?? "Failed to complete task");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDone || deleting) return;
    if (!window.confirm(`Delete "${title}"? This removes all updates, attachments, comments, and logs. This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    setError(null);
    const res = await deleteTask(id);
    setDeleting(false);
    if (!res.success) {
      setError(res.error ?? "Failed to delete task");
    } else {
      // Immediately remove card from UI
      onDelete?.();
    }
  };

  return (
    <div className="relative group">
      <Link href={`/tasks/${id}`}>
        <Card className="h-full cursor-pointer transition-all duration-200 hover:border-moto-cyan/30 hover:shadow-[0_2px_8px_oklch(0.45_0.10_220/0.1)]">
          <CardHeader className="pb-1">
            <p className="text-sm font-medium text-foreground tracking-tight line-clamp-1">
              {title}
            </p>

            <div className="flex gap-1 flex-wrap mt-1">
              {status && (
                <Badge variant={statusVariant[status] ?? "secondary"}>
                  {status.replace("_", " ")}
                </Badge>
              )}

              {priority && (
                <Badge variant={priorityVariant[priority] ?? "ghost"}>
                  {priority}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-1.5 text-xs text-muted-foreground">
            {assignee && (
              <p>
                <span className="font-semibold">Assigned to:</span>{" "}
                {assignee}
              </p>
            )}
            {assignees && assignees.length > 0 && (
              <p>
                <span className="font-semibold">Assignees:</span>{" "}
                {assignees.map((a: any) => a.full_name).join(", ")}
              </p>
            )}

            {subsystem && (
              <p>
                <span className="font-semibold">Subsystem:</span>{" "}
                {subsystem}
              </p>
            )}

            {deadline && (
              <p>
                <span className="font-semibold">Due:</span>{" "}
                <span className="moto-number">
                  {format(new Date(deadline), "MMM dd, yyyy")}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Action buttons — visible on hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-all group-hover:opacity-100">
        {/* Complete button — only for non-done tasks */}
        {!isDone && (
          <button
            onClick={handleComplete}
            disabled={completing}
            title={completing ? "Completing..." : "Mark complete"}
            className="flex size-7 items-center justify-center rounded border border-[#2a2a32] bg-[#0a0a0d]/70 text-[#6a6a78] hover:border-[#22c55e]/40 hover:bg-[#051a0a] hover:text-[#22c55e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completing ? (
              <span className="size-3 animate-spin rounded-full border border-[#6a6a78] border-t-transparent" />
            ) : (
              "✓"
            )}
          </button>
        )}

        {/* Delete button — only for completed tasks */}
        {isDone && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title={deleting ? "Deleting..." : "Delete completed task"}
            className="flex size-7 items-center justify-center rounded border border-[#2a2a32] bg-[#0a0a0d]/70 text-[#6a6a78] hover:border-[#e8241a]/40 hover:bg-[#1a0808] hover:text-[#e8241a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <span className="size-3 animate-spin rounded-full border border-[#6a6a78] border-t-transparent" />
            ) : (
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Error toast */}
      {error && (
        <div className="absolute top-2 left-2 right-2 rounded border border-[#e8241a]/30 bg-[#1a0808] px-2 py-1 text-[10px] text-[#f87171] z-10">
          {error}
          <button onClick={() => setError(null)} className="ml-1 text-[#6a6a78] hover:text-[#b8b8c4]">✕</button>
        </div>
      )}
    </div>
  );
}
