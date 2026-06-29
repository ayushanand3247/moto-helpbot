"use client";

import { useState, useMemo } from "react";
import { Check, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubsystemPill, type SubsystemKey } from "./SubsystemCard";

// ── Types ─────────────────────────────────────────────────────
export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type TaskStatus = "To Do" | "In Progress" | "In Review" | "Done";

export type Task = {
  id: string;
  title: string;
  description?: string;
  subsystem: SubsystemKey | string;
  assignee: { name: string; initials: string };
  priority: Priority;
  dueDate: string; // display string e.g. "28 May 2025"
  status: TaskStatus;
};

// ── Priority badge ─────────────────────────────────────────────
const PRIORITY_STYLES: Record<Priority, string> = {
  HIGH:   "bg-[#2a1c00] text-[#f59e0b] border-[#f59e0b]/20",
  MEDIUM: "bg-[#0a1a2a] text-[#60a5fa] border-[#60a5fa]/20",
  LOW:    "bg-[#1a1a1a] text-[#8a8a98] border-[#6a6a78]/30",
};

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn(
      "inline-flex h-4 items-center rounded-sm border px-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.08em]",
      PRIORITY_STYLES[priority]
    )}>
      {priority}
    </span>
  );
}

// ── Status selector (dropdown-style inline) ──────────────────
const STATUS_STYLES: Record<TaskStatus, string> = {
  "To Do":      "text-[#8a8a98] border-[#2a2a32]",
  "In Progress":"text-[#60a5fa] border-[#60a5fa]/30 bg-[#0a1a2a]",
  "In Review":  "text-[#f59e0b] border-[#f59e0b]/30 bg-[#1a1000]",
  "Done":       "text-[#22c55e] border-[#22c55e]/30 bg-[#051a0a]",
};

function StatusBadge({
  status,
  onChange,
}: {
  status: TaskStatus;
  onChange: (s: TaskStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const statuses: TaskStatus[] = ["To Do", "In Progress", "In Review", "Done"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          "inline-flex h-6 items-center gap-1 rounded-sm border px-2 font-mono text-[10px] font-medium transition-colors",
          STATUS_STYLES[status]
        )}
      >
        {status}
        <svg className="size-2.5 opacity-50" viewBox="0 0 8 8" fill="currentColor">
          <path d="M4 5.5L1 2.5h6L4 5.5z"/>
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-32 overflow-hidden rounded-sm border border-[#222228] bg-[#0d0d11] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className={cn(
                "flex w-full items-center px-2 py-1.5 font-mono text-[10px] text-[#b8b8c4] transition-colors hover:bg-[#16161b] hover:shadow-[inset_2px_0_0_#e8241a]",
                s === status && "text-[#e2e2ea]"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main TaskTable ─────────────────────────────────────────────
type TaskTableProps = {
  tasks: Task[];
  onComplete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onNewTask?: () => void;
  currentUser?: { id: string; name: string; role: string } | null;
  className?: string;
};

type FilterTab = "All Tasks" | "My Tasks" | "Due Today" | "Overdue";

export function TaskTable({
  tasks,
  onComplete,
  onStatusChange,
  onNewTask,
  currentUser,
  className,
}: TaskTableProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("All Tasks");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, TaskStatus>>({});

  // Derive tab counts from real data
  const today = new Date().toISOString().slice(0, 10);
  const myTasksCount = currentUser
    ? tasks.filter((t) => t.assignee.name === currentUser.name).length
    : 0;
  const dueTodayCount = tasks.filter((t) => {
    const ymd = (t as any)._dueYMD || "";
    return ymd === today;
  }).length;
  const overdueCount = tasks.filter((t) => {
    const ymd = (t as any)._dueYMD || "";
    return ymd !== "" && ymd < today && t.status !== "Done";
  }).length;

  const tabs: { label: FilterTab; count?: number }[] = [
    { label: "All Tasks" },
    { label: "My Tasks", count: myTasksCount || undefined },
    { label: "Due Today", count: dueTodayCount || undefined },
    { label: "Overdue",   count: overdueCount || undefined },
  ];

  // Filter tasks by active tab
  const tabFilteredTasks = useMemo(() => {
    switch (activeTab) {
      case "All Tasks":
        return tasks;
      case "My Tasks":
        return currentUser
          ? tasks.filter((t) => t.assignee.name === currentUser.name)
          : tasks;
      case "Due Today":
        return tasks.filter((t) => (t as any)._dueYMD === today);
      case "Overdue":
        return tasks.filter(
          (t) => (t as any)._dueYMD && (t as any)._dueYMD < today && t.status !== "Done"
        );
      default:
        return tasks;
    }
  }, [tasks, activeTab, currentUser, today]);

  function handleComplete(taskId: string) {
    setCompletingId(taskId);
    onComplete?.(taskId);
    // Clear completing state after a short delay for the visual feedback
    setTimeout(() => setCompletingId(null), 600);
  }

  function handleStatusChange(taskId: string, status: TaskStatus) {
    setLocalStatuses(prev => ({ ...prev, [taskId]: status }));
    onStatusChange?.(taskId, status);
  }

  return (
    <div className={cn("rounded-sm border border-[#1e1e24] overflow-hidden", className)}>

      {/* ── Table toolbar ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b border-[#1e1e24] bg-[#070709] px-4 py-2.5">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map(tab => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={cn(
                "flex h-6 items-center gap-1.5 rounded-sm px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em] transition-colors",
                activeTab === tab.label
                  ? "bg-[#14141a] text-[#e2e2ea] shadow-[inset_2px_0_0_#e8241a]"
                  : "text-[#6a6a78] hover:text-[#b8b8c4]"
              )}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={cn(
                  "flex size-4 items-center justify-center rounded-full font-mono text-[9px]",
                  tab.label === "Overdue"
                    ? "bg-[#2a0804] text-[#e8241a]"
                    : "bg-[#1a1a20] text-[#8a8a98]"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="flex h-6 items-center gap-1.5 rounded-sm border border-[#2a2a32] px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-[#8a8a98] transition-colors hover:border-[#6a6a78] hover:text-[#b8b8c4]">
            <SlidersHorizontal className="size-3" strokeWidth={1.75} />
            Filter
          </button>
          <button
            onClick={onNewTask}
            className="flex h-6 items-center gap-1.5 rounded-sm bg-[#e8241a] px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#d41e16]"
          >
            <Plus className="size-3" strokeWidth={2.5} />
            New Task
          </button>
        </div>
      </div>

      {/* ── Column headers ────────────────────────────────── */}
      <div className="grid bg-[#070709] px-4 py-2"
        style={{ gridTemplateColumns: "2fr 120px 100px 80px 100px 120px 80px" }}>
        {["Task", "Subsystem", "Assignee", "Priority", "Due Date", "Status", "Actions"].map(h => (
          <span key={h} className="font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-[#6a6a78]">
            {h}
          </span>
        ))}
      </div>

      {/* ── Rows ──────────────────────────────────────────── */}
      <div>
        {tabFilteredTasks.map((task) => {
          const currentStatus = localStatuses[task.id] ?? task.status;
          const isDone = currentStatus === "Done";
          const isCompleting = completingId === task.id;

          return (
            <div
              key={task.id}
              className={cn(
                "grid items-center border-b border-[#1a1a20] px-4 py-2.5 transition-colors duration-75",
                "hover:bg-[#0d0d11] hover:shadow-[inset_2px_0_0_#e8241a]",
                "last:border-0",
                isDone && "opacity-50"
              )}
              style={{ gridTemplateColumns: "2fr 120px 100px 80px 100px 120px 80px" }}
            >
              {/* Task title + desc */}
              <div className="min-w-0 pr-4">
                <p className={cn(
                  "truncate text-[12px] font-medium text-[#e2e2ea]",
                  isDone && "line-through text-[#8a8a98]"
                )}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="truncate font-mono text-[10px] text-[#6a6a78]">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Subsystem */}
              <div>
                <SubsystemPill subsystem={task.subsystem} />
              </div>

              {/* Assignee */}
              <div className="flex items-center gap-1.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-[#14141a] font-mono text-[7px] font-semibold uppercase text-[#8a8a98]">
                  {task.assignee.initials}
                </div>
                <span className="truncate text-[11px] text-[#b8b8c4]">
                  {task.assignee.name}
                </span>
              </div>

              {/* Priority */}
              <div>
                <PriorityBadge priority={task.priority} />
              </div>

              {/* Due date */}
              <div>
                <span className="font-mono text-[11px] text-[#8a8a98]">
                  {task.dueDate}
                </span>
              </div>

              {/* Status */}
              <div>
                <StatusBadge
                  status={currentStatus}
                  onChange={(s) => handleStatusChange(task.id, s)}
                />
              </div>

              {/* Actions — Mark Complete + overflow */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => !isDone && handleComplete(task.id)}
                  disabled={isDone}
                  title={isDone ? "Already done" : "Mark complete"}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-sm border transition-colors",
                    isDone
                      ? "border-[#22c55e]/30 bg-[#051a0a] text-[#22c55e] cursor-default"
                      : isCompleting
                        ? "border-[#22c55e]/30 bg-[#051a0a] text-[#22c55e]"
                        : "border-[#2a2a32] text-[#6a6a78] hover:border-[#22c55e]/40 hover:bg-[#051a0a] hover:text-[#22c55e]"
                  )}
                >
                  <Check className="size-3" strokeWidth={2.5} />
                </button>
                <button className="flex size-6 items-center justify-center rounded-sm text-[#6a6a78] transition-colors hover:bg-[#0e0e12] hover:text-[#b8b8c4]">
                  <MoreHorizontal className="size-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="flex items-center justify-center border-t border-[#1a1a20] bg-[#070709] px-4 py-2.5">
        <button className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#6a6a78] transition-colors hover:text-[#b8b8c4]">
          View all tasks
          <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M2 6h8M7 3l3 3-3 3"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
