"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Search, Plus, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubsystemCard, type SubsystemKey } from "@/components/ui/SubsystemCard";
import { TaskTable, type Task, type TaskStatus } from "@/components/ui/TaskTable";
import { getTaskAssignees, createTask } from "@/actions/tasks";
import { updateTaskStatus } from "@/lib/actions/dashboard";
import { getSubsystems } from "@/lib/subsystems/get-subsystems";
import type { Notification } from "@/lib/actions/notifications";

type Props = {
  initialTasks: Task[];
  subsystemStats: {
    name: SubsystemKey;
    progress: number;
    taskCount: number;
    avatars: { initials: string; name: string }[];
    extraCount: number;
  }[];
  notifications: Notification[];
  currentUser: { id: string; name: string; role: string; subsystem?: string } | null;
  stats: { label: string; value: string; sub: string; accent?: boolean }[];
  deadlines: { date: string; title: string; subsystem: string; priority: string }[];
  activity: { actor: string; name: string; action: string; subsystem: string; time: string }[];
};

const PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;
const STATUSES: TaskStatus[] = ["To Do", "In Progress", "In Review", "Done"];

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateToYMD(dateStr: string): string {
  // Handles "28 May 2025" format from TaskTable
  try {
    const months: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const parts = dateStr.split(" ");
    if (parts.length === 3) {
      return `${parts[2]}-${months[parts[1].toLowerCase()]}-${parts[0].padStart(2, "0")}`;
    }
  } catch {}
  return "";
}

export default function DashboardClient({
  initialTasks,
  subsystemStats,
  notifications,
  currentUser,
  stats,
  deadlines,
  activity,
}: Props) {
  // ── Search + filter state ─────────────────────────────────
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSubs, setFilterSubs] = useState<string[]>([]);
  const [filterPrio, setFilterPrio] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);

  // ── Notification popover ──────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);

  // ── New task modal ────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [assignees, setAssignees] = useState<{ id: string; full_name: string; avatar_url?: string | null; subsystem_name?: string }[]>([]);
  const [subsystems, setSubsystems] = useState<{ id: string; name: string }[]>([]);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subsystem_id: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    due_date: "",
    status: "TODO" as string,
  });

  // ── Task status overrides (optimistic) ────────────────────
  const [statusOverrides, setStatusOverrides] = useState<Record<string, TaskStatus>>({});
  const [statusError, setStatusError] = useState<string | null>(null);

  // ── Derived tasks with overrides ──────────────────────────
  const tasks = useMemo(() => {
    return initialTasks.map((t) =>
      statusOverrides[t.id] ? { ...t, status: statusOverrides[t.id] } : t
    );
  }, [initialTasks, statusOverrides]);

  // ── Search + filter logic ────────────────────────────────
  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (filterSubs.length > 0) {
      result = result.filter((t) => filterSubs.includes(t.subsystem));
    }
    if (filterPrio.length > 0) {
      result = result.filter((t) => filterPrio.includes(t.priority));
    }
    if (filterStatus.length > 0) {
      result = result.filter((t) => filterStatus.includes(t.status));
    }

    return result;
  }, [tasks, search, filterSubs, filterPrio, filterStatus]);

  const hasFilters = filterSubs.length > 0 || filterPrio.length > 0 || filterStatus.length > 0;

  // ── Handlers ──────────────────────────────────────────────
  const router = useRouter();

  const handleComplete = useCallback(
    async (id: string) => {
      setStatusError(null);
      setStatusOverrides((prev) => ({ ...prev, [id]: "Done" }));
      const res = await updateTaskStatus(id, "Done");
      if (!res.success) {
        setStatusOverrides((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setStatusError(res.error ?? "Failed to update task");
      } else {
        router.refresh();
      }
    },
    [router]
  );

  const handleStatusChange = useCallback(
    async (id: string, status: TaskStatus) => {
      setStatusError(null);
      setStatusOverrides((prev) => ({ ...prev, [id]: status }));
      const res = await updateTaskStatus(id, status);
      if (!res.success) {
        setStatusOverrides((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setStatusError(res.error ?? "Failed to update task");
      } else {
        router.refresh();
      }
    },
    [router]
  );

  const openModal = async () => {
    setModalOpen(true);
    setFormError("");
    setSelectedAssigneeIds([]);
    // Lazy-load assignees and subsystems
    if (assignees.length === 0) {
      const list = await getTaskAssignees();
      setAssignees(list);
    }
    if (subsystems.length === 0) {
      const subs = await getSubsystems();
      setSubsystems(subs);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await createTask({
        title: form.title,
        description: form.description || undefined,
        subsystem_id: form.subsystem_id || undefined,
        assigned_to_ids: selectedAssigneeIds,
        priority: form.priority,
        due_date: form.due_date || undefined,
        status: form.status as any,
      });
      setModalOpen(false);
      setSelectedAssigneeIds([]);
      setForm({
        title: "",
        description: "",
        subsystem_id: "",
        priority: "MEDIUM",
        due_date: "",
        status: "TODO",
      });
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const initials = currentUser
    ? currentUser.name.trim().split(/\s+/).length >= 2
      ? (currentUser.name[0] + currentUser.name.split(/\s+/).pop()![0]).toUpperCase()
      : currentUser.name.slice(0, 2).toUpperCase()
    : "—";

  return (
    <div className="flex min-h-screen flex-col bg-[#050507]">
      {/* ── Top bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[#111115] bg-[#050507] px-6">
        <div>
          <h1 className="text-[18px] font-semibold tracking-[-0.03em] text-[#e2e2ea]">
            Dashboard
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6a6a78]">
            Welcome back, {currentUser?.name?.split(" ")[0] ?? "User"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex h-7 w-48 items-center gap-2 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2.5">
            <Search className="size-3 shrink-0 text-[#6a6a78]" strokeWidth={1.75} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search anything..."
              className="w-full bg-transparent font-mono text-[11px] text-[#c8c8d0] placeholder:text-[#5a5a68] outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-[#6a6a78] hover:text-[#b8b8c4]">
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative flex size-7 items-center justify-center rounded-sm text-[#8a8a98] transition-colors hover:bg-[#0e0e12] hover:text-[#b8b8c4]"
            >
              <Bell className="size-4" strokeWidth={1.75} />
              {notifications.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-[#e8241a] font-mono text-[8px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-sm border border-[#222228] bg-[#0d0d11] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                <div className="border-b border-[#1e1e24] px-3 py-2">
                  <p className="font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-[#8a8a98]">
                    Notifications
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-3 py-4 text-center font-mono text-[10px] text-[#6a6a78]">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href="/tasks"
                        onClick={() => setNotifOpen(false)}
                        className="flex items-start gap-2 px-3 py-2.5 transition-colors hover:bg-[#16161b]"
                      >
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-[#14141a] font-mono text-[7px] font-semibold uppercase text-[#8a8a98]">
                          {n.actor}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] text-[#c8c8d0]">
                            <span className="font-medium">{n.name}</span>{" "}
                            <span className="text-[#8a8a98]">{n.action}</span>
                          </p>
                          <p className="font-mono text-[9px] text-[#6a6a78]">
                            {n.subsystem} · {n.time}
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-sm bg-[#14141a] font-mono text-[10px] font-semibold uppercase text-[#8a8a98]">
              {initials}
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#c8c8d0]">{currentUser?.name ?? "User"}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#6a6a78]">
                {currentUser?.role ?? "MEMBER"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="flex flex-1 gap-0">
        <main className="flex-1 min-w-0 p-8 space-y-8 flex flex-col">

          {/* ── Stat strip ───────────────────────────────── */}
          <div className="grid grid-cols-5 divide-x divide-[#1e1e24] rounded-sm border border-[#1e1e24] bg-[#0a0a0d]">
            {stats.map((m) => (
              <div key={m.label} className="px-6 py-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#6a6a78]">
                  {m.label}
                </p>
                <p className={`font-mono text-[28px] font-bold leading-tight tracking-[-0.03em] ${m.accent ? "text-[#22c55e]" : "text-[#e2e2ea]"}`}>
                  {m.value}
                </p>
                <p className="font-mono text-[10px] text-[#8a8a98]">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Subsystem overview ───────────────────────── */}
          <section>
            <p className="section-eyebrow mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a98]">
              Subsystem Overview
            </p>
            <div className="grid grid-cols-4 gap-4">
              {subsystemStats.map((s) => (
                <SubsystemCard
                  key={s.name}
                  subsystem={s.name}
                  progress={s.progress}
                  taskCount={s.taskCount}
                  avatars={s.avatars}
                  extraCount={s.extraCount}
                  href={`/subsystems/${s.name.toLowerCase().replace(/\s+/g, "-")}`}
                />
              ))}
            </div>
          </section>

          {/* ── Task table ───────────────────────────────── */}
          <section>
            <p className="section-eyebrow mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a98]">
              Subsystem Tasks
            </p>
            {statusError && (
              <div className="mb-3 flex items-center gap-2 rounded-sm border border-[#e8241a]/30 bg-[#1a0808] px-3 py-2 text-[11px] text-[#f87171]">
                <span className="size-1.5 rounded-full bg-[#e8241a]" />
                {statusError}
                <button onClick={() => setStatusError(null)} className="ml-auto text-[#6a6a78] hover:text-[#b8b8c4]">✕</button>
              </div>
            )}
            <TaskTable
              tasks={filteredTasks}
              onComplete={handleComplete}
              onStatusChange={handleStatusChange}
              onNewTask={openModal}
              currentUser={currentUser}
            />
          </section>
        </main>

        {/* ── Right panel ─────────────────────────────────── */}
        <aside className="w-[280px] shrink-0 space-y-0 border-l border-[#111115]">
          {/* Upcoming deadlines */}
          <div className="border-b border-[#111115] p-6">
            <p className="section-eyebrow mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a98]">
              Upcoming Deadlines
            </p>
            <div className="space-y-2">
              {deadlines.map((d, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-8 shrink-0 text-center">
                    <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-[#6a6a78]">
                      {d.date.split(" ")[0]}
                    </p>
                    <p className="font-mono text-[13px] font-bold text-[#e2e2ea]">
                      {d.date.split(" ")[1] || ""}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-[#c8c8d0]">
                      {d.title}
                    </p>
                    <p className="font-mono text-[9px] text-[#6a6a78]">
                      {d.subsystem}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/calendar" className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#6a6a78] transition-colors hover:text-[#b8b8c4]">
              View Calendar
              <svg className="size-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M2 6h8M7 3l3 3-3 3"/>
              </svg>
            </Link>
          </div>

          {/* Recent activity */}
          <div className="p-6">
            <p className="section-eyebrow mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a98]">
              Recent Activity
            </p>
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-[#14141a] font-mono text-[7px] font-semibold uppercase text-[#8a8a98]">
                    {a.actor}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#c8c8d0]">
                      <span className="font-medium">{a.name}</span>{" "}
                      <span className="text-[#8a8a98]">{a.action}</span>
                    </p>
                    <p className="font-mono text-[9px] text-[#6a6a78]">
                      {a.subsystem} · {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/activity" className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#6a6a78] transition-colors hover:text-[#b8b8c4]">
              View all activity
              <svg className="size-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M2 6h8M7 3l3 3-3 3"/>
              </svg>
            </Link>
          </div>
        </aside>
      </div>

      {/* ── New Task modal ─────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-sm border border-[#222228] bg-[#0d0d11] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a98]">
                New Task
              </p>
              <button onClick={() => setModalOpen(false)} className="text-[#6a6a78] hover:text-[#b8b8c4]">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Title */}
              <div>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Title *"
                  className={cn(
                    "h-8 w-full rounded-sm border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70",
                    formError && !form.title.trim() ? "border-[#e8241a]" : "border-border/60"
                  )}
                />
                {formError && !form.title.trim() && (
                  <p className="mt-1 font-mono text-[9px] text-[#e8241a]">Title is required.</p>
                )}
              </div>

              {/* Description */}
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
                rows={2}
                className="w-full rounded-sm border border-border/60 bg-input px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 resize-none"
              />

              {/* Subsystem dropdown — dynamic from DB */}
              <div>
                <select
                  value={form.subsystem_id}
                  onChange={(e) => setForm((f) => ({ ...f, subsystem_id: e.target.value }))}
                  className="h-8 w-full rounded-sm border border-border/60 bg-input px-2 text-sm text-foreground outline-none"
                >
                  <option value="">Select subsystem…</option>
                  {subsystems.length === 0 ? (
                    <option disabled>No subsystems available.</option>
                  ) : (
                    subsystems.map((s) => <option key={s.id} value={s.id}>{(s as any).icon ? `${(s as any).icon} ` : ""}{s.name}</option>)
                  )}
                </select>
              </div>

              {/* Multi-assignee selector */}
              <div className="space-y-1.5">
                <p className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">Assignees</p>
                {selectedAssigneeIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAssigneeIds.map((uid) => {
                      const u = assignees.find((a) => a.id === uid);
                      if (!u) return null;
                      return (
                        <span key={uid} className="inline-flex items-center gap-1 rounded-sm border border-border/40 bg-[#0e0e12] px-1.5 py-0.5 text-[10px] text-[#b8b8c4]">
                          {u.full_name}
                          {u.subsystem_name && <span className="text-muted-foreground/60">· {u.subsystem_name}</span>}
                          <button
                            type="button"
                            onClick={() => setSelectedAssigneeIds((prev) => prev.filter((id) => id !== uid))}
                            className="ml-0.5 text-muted-foreground/60 hover:text-[#e8241a]"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <select
                  onChange={(e) => {
                    if (e.target.value && !selectedAssigneeIds.includes(e.target.value)) {
                      setSelectedAssigneeIds((prev) => [...prev, e.target.value]);
                    }
                    e.target.value = "";
                  }}
                  className="h-7 w-full rounded-sm border border-border/60 bg-input px-2 text-xs text-foreground outline-none"
                >
                  <option value="">+ Add member…</option>
                  {assignees
                    .filter((a) => !selectedAssigneeIds.includes(a.id))
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.full_name}{a.subsystem_name ? ` — ${a.subsystem_name}` : ""}
                      </option>
                    ))}
                </select>
              </div>

              {/* Priority + Status row */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as any }))}
                  className="h-8 rounded-sm border border-border/60 bg-input px-2 text-sm text-foreground outline-none"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="h-8 rounded-sm border border-border/60 bg-input px-2 text-sm text-foreground outline-none"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="APPROVED">Done</option>
                </select>
              </div>

              {/* Due date */}
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                className="h-8 w-full rounded-sm border border-border/60 bg-input px-3 text-sm text-foreground outline-none"
              />

              {formError && form.title.trim() && (
                <p className="font-mono text-[9px] text-[#e8241a]">{formError}</p>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="h-7 rounded-sm border border-[#2a2a32] px-3 font-mono text-[10px] uppercase tracking-[0.06em] text-[#8a8a98] hover:text-[#b8b8c4]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="h-7 rounded-sm bg-[#e8241a] px-3 font-mono text-[10px] uppercase tracking-[0.06em] text-white hover:bg-[#d41e16] disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
