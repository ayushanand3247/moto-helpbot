"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "@/lib/database/database.types";
import { differenceInDays, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { deleteTask } from "@/actions/tasks/delete-task";

type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  milestone?: {
    id: string;
    title: string;
    project_id: string;
  } | null;
  assigned_to_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    email: string;
  } | null;
  created_by_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    email: string;
  } | null;
  subsystem?: {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
  } | null;
  task_assignments?: Array<{
    user_id: string;
    assigned_at: string;
    assigned_by: string | null;
    profile?: {
      id: string;
      full_name: string;
      avatar_url?: string | null;
      email: string;
      subsystem_id?: string | null;
      profile_subsystem?: { name: string } | null;
    } | null;
  }>;
};

interface MetadataPanelProps {
  task: Task;
}

function formatMetadataDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return `${date.getUTCDate().toString().padStart(2, "0")}/${(date.getUTCMonth() + 1).toString().padStart(2, "0")}/${date.getUTCFullYear()}`;
}

export function MetadataPanel({ task }: MetadataPanelProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isDone = task.status === "APPROVED";

  const handleDelete = async () => {
    if (!isDone) return;
    if (!window.confirm(`Delete "${task.title}"? This removes all updates, attachments, and logs. This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    const res = await deleteTask(task.id);
    setDeleting(false);
    if (!res.success) {
      setDeleteError(res.error ?? "Failed to delete task");
    } else {
      router.push("/tasks");
    }
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

  const getDeadlineColor = (deadline: string | null) => {
    if (!deadline) return "text-muted-foreground";
    if (isPast(new Date(deadline))) return "text-moto-red";
    const daysRemaining = differenceInDays(new Date(deadline), new Date());
    if (daysRemaining <= 7) return "text-moto-amber";
    return "text-moto-green";
  };

  return (
    <div className="rounded-lg border border-border/40 bg-card/50 p-4 space-y-4">
      {/* Status */}
      <div>
        <p className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground mb-2">Status</p>
        <Badge variant={statusVariant[task.status || "TODO"] ?? "secondary"}>
          {(task.status || "TODO").replace("_", " ")}
        </Badge>
      </div>

      {/* Priority */}
      {task.priority && (
        <div>
          <p className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground mb-2">Priority</p>
          <Badge variant={priorityVariant[task.priority] ?? "ghost"}>
            {task.priority}
          </Badge>
        </div>
      )}

      {/* Assignees (supports multiple via junction table) */}
      {(() => {
        const assignments = task.task_assignments || [];
        if (assignments.length === 0 && !task.assigned_to_profile) return null;
        return (
          <div>
            <p className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground mb-2">
              Assigned To
            </p>
            <div className="space-y-2">
              {assignments.length > 0 ? (
                assignments.map((ta: any) => (
                  <div key={ta.user_id} className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-moto-cyan/10 border border-moto-cyan/20 flex items-center justify-center text-[0.5rem] font-semibold text-moto-cyan uppercase overflow-hidden shrink-0">
                      {ta.profile?.avatar_url ? (
                        <img
                          src={ta.profiles.avatar_url}
                          alt={ta.profiles.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (ta.profile?.full_name ?? "?").charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground/90 truncate">
                        {ta.profile?.full_name ?? "Unknown"}
                      </p>
                      {ta.profile?.profile_subsystem?.name && (
                        <p className="text-[0.6rem] text-muted-foreground/70 truncate">
                          {ta.profile.profile_subsystem?.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : task.assigned_to_profile ? (
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-moto-cyan/10 border border-moto-cyan/20 flex items-center justify-center text-[0.5rem] font-semibold text-moto-cyan uppercase overflow-hidden shrink-0">
                    {task.assigned_to_profile.avatar_url ? (
                      <img
                        src={task.assigned_to_profile.avatar_url}
                        alt={task.assigned_to_profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      task.assigned_to_profile.full_name.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground/90">
                      {task.assigned_to_profile.full_name}
                    </p>
                    <p className="text-[0.6rem] text-muted-foreground/70">
                      {task.assigned_to_profile.email}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        );
      })()}

      {/* Subsystem */}
      {task.subsystem && (
        <div>
          <p className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground mb-2">Subsystem</p>
          <div className="flex items-center gap-2">
            {task.subsystem.icon && (
              <span className="text-sm">{task.subsystem.icon}</span>
            )}
            <span className="text-xs font-medium text-foreground/90">
              {task.subsystem.name}
            </span>
          </div>
        </div>
      )}

      {/* Milestone */}
      {task.milestone && (
        <div>
          <p className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground mb-2">Milestone</p>
          <p className="text-xs font-medium text-foreground/90">
            {task.milestone.title}
          </p>
        </div>
      )}

      {/* Deadline */}
      {task.deadline && (
        <div>
          <p className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground mb-2">Deadline</p>
          <p className={`text-xs font-medium moto-number ${getDeadlineColor(task.deadline)}`}>
            {formatMetadataDate(task.deadline)}
            {isPast(new Date(task.deadline)) && <span className="text-moto-red ml-1"> (Overdue)</span>}
          </p>
        </div>
      )}

      {/* Hours */}
      <div className="grid grid-cols-2 gap-3">
        {task.estimated_hours && (
          <div>
            <p className="text-[0.6rem] font-semibold tracking-wider uppercase text-muted-foreground/70 mb-1">
              Estimated
            </p>
            <p className="moto-number text-base font-bold text-foreground/90">
              {task.estimated_hours}<span className="text-[0.6rem] font-normal text-muted-foreground/70 ml-0.5">h</span>
            </p>
          </div>
        )}
        {task.actual_hours && (
          <div>
            <p className="text-[0.6rem] font-semibold tracking-wider uppercase text-muted-foreground/70 mb-1">
              Actual
            </p>
            <p className="moto-number text-base font-bold text-moto-cyan">
              {task.actual_hours}<span className="text-[0.6rem] font-normal text-moto-cyan/50 ml-0.5">h</span>
            </p>
          </div>
        )}
      </div>

      {/* Created By */}
      {task.created_by_profile && (
        <div className="pt-3 border-t border-border/30">
          <p className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground mb-2">Created By</p>
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-muted/50 border border-border/30 flex items-center justify-center text-[0.5rem] font-medium text-muted-foreground uppercase overflow-hidden">
              {task.created_by_profile.avatar_url ? (
                <img
                  src={task.created_by_profile.avatar_url}
                  alt={task.created_by_profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                task.created_by_profile.full_name.charAt(0)
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/80">
                {task.created_by_profile.full_name}
              </p>
              <p className="text-[0.6rem] moto-number text-muted-foreground/70">
                {formatMetadataDate(task.created_at)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete — only for completed tasks */}
      {isDone && (
        <div className="pt-3 border-t border-border/30 space-y-2">
          <p className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">Danger Zone</p>
          {deleteError && (
            <div className="rounded border border-[#e8241a]/30 bg-[#1a0808] px-2 py-1.5 text-[10px] text-[#f87171]">
              {deleteError}
            </div>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex w-full items-center justify-center gap-1.5 rounded border border-[#e8241a]/30 bg-[#1a0808]/50 px-3 py-2 text-[11px] font-medium text-[#f87171] transition-colors hover:bg-[#1a0808] hover:border-[#e8241a]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <span className="size-3 animate-spin rounded-full border border-[#f87171] border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Delete Completed Task
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
