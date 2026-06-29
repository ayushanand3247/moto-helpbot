// app/(dashboard)/dashboard/page.tsx
// Pure UI shell — wire real data from your existing Server Actions / Supabase queries.
// All data shapes are commented with where to fetch from.

import { Bell, Search } from "lucide-react";
import { SubsystemCard, type SubsystemKey } from "@/components/ui/SubsystemCard";
import { TaskTable, type Task } from "@/components/ui/TaskTable";

// ── Static placeholder data (replace with real queries) ───────
// These match the types your existing Server Actions already return.

const STAT_METRICS = [
  { label: "Active Projects",  value: "6",   sub: "2 in progress" },
  { label: "Total Tasks",      value: "128",  sub: "32 Pending" },
  { label: "Completed",        value: "74",   sub: "56%", accent: true },
  { label: "Team Members",     value: "48",   sub: "Across 4 subsystems" },
  { label: "Upcoming Reviews", value: "3",    sub: "This week" },
];

// Replace with: const subsystems = await getSubsystemOverview();
const SUBSYSTEM_DATA: {
  name: SubsystemKey;
  progress: number;
  taskCount: number;
  avatars: { initials: string; name: string }[];
  extraCount: number;
}[] = [
  {
    name: "Structures",
    progress: 72,
    taskCount: 18,
    avatars: [
      { initials: "RI", name: "Rishabh" },
      { initials: "AT", name: "Atharv" },
      { initials: "SA", name: "Sarthak" },
    ],
    extraCount: 4,
  },
  {
    name: "Transmission" as SubsystemKey,
    progress: 65,
    taskCount: 22,
    avatars: [
      { initials: "AT", name: "Atharv" },
      { initials: "AR", name: "Aryan" },
      { initials: "HA", name: "Harsh" },
    ],
    extraCount: 6,
  },
  {
    name: "Vehicle Dynamics" as SubsystemKey,
    progress: 55,
    taskCount: 14,
    avatars: [
      { initials: "HA", name: "Harsh" },
      { initials: "RI", name: "Rishabh" },
    ],
    extraCount: 3,
  },
  {
    name: "Aerodynamics" as SubsystemKey,
    progress: 70,
    taskCount: 10,
    avatars: [
      { initials: "AR", name: "Aryan" },
    ],
    extraCount: 2,
  },
  {
    name: "EPT (Electrical, Powertrain & Telemetry)" as SubsystemKey,
    progress: 80,
    taskCount: 16,
    avatars: [
      { initials: "SA", name: "Sarthak" },
      { initials: "RI", name: "Rishabh" },
    ],
    extraCount: 3,
  },
  {
    name: "Machine Learning" as SubsystemKey,
    progress: 60,
    taskCount: 12,
    avatars: [
      { initials: "AR", name: "Aryan" },
      { initials: "AT", name: "Atharv" },
    ],
    extraCount: 2,
  },
];

// Replace with: const tasks = await getTasks({ limit: 10 });
const SAMPLE_TASKS: Task[] = [
  {
    id: "1",
    title: "Front Bulkhead FEA Simulation",
    description: "Validate under braking loads",
    subsystem: "Structures",
    assignee: { name: "Rishabh", initials: "RI" },
    priority: "HIGH",
    dueDate: "28 May 2025",
    status: "In Progress",
  },
  {
    id: "2",
    title: "Battery Pack Finalization",
    description: "Finalize cell layout and BMS",
    subsystem: "Powertrain",
    assignee: { name: "Atharv", initials: "AT" },
    priority: "HIGH",
    dueDate: "25 May 2025",
    status: "To Do",
  },
  {
    id: "3",
    title: "Motor Controller PCB Layout",
    description: "Design and review",
    subsystem: "Electronics",
    assignee: { name: "Sarthak", initials: "SA" },
    priority: "MEDIUM",
    dueDate: "30 May 2025",
    status: "In Progress",
  },
  {
    id: "4",
    title: "Traction Control Algorithm",
    description: "Implement slip ratio logic",
    subsystem: "ML & Controls",
    assignee: { name: "Aryan", initials: "AR" },
    priority: "MEDIUM",
    dueDate: "02 Jun 2025",
    status: "To Do",
  },
  {
    id: "5",
    title: "Swingarm Manufacturing",
    description: "CNC + Post processing",
    subsystem: "Structures",
    assignee: { name: "Harsh", initials: "HA" },
    priority: "LOW",
    dueDate: "05 Jun 2025",
    status: "Done",
  },
];

const UPCOMING_DEADLINES = [
  { date: "MAY 25", title: "Battery Pack Finalization",   subsystem: "EPT (Electrical, Powertrain & Telemetry)", priority: "HIGH"   },
  { date: "MAY 28", title: "Front Bulkhead FEA",          subsystem: "Structures",                              priority: "HIGH"   },
  { date: "MAY 30", title: "Motor Controller PCB",        subsystem: "EPT (Electrical, Powertrain & Telemetry)", priority: "MEDIUM" },
  { date: "JUN 02", title: "Traction Control Algorithm",  subsystem: "Machine Learning",                        priority: "MEDIUM" },
  { date: "JUN 05", title: "Swingarm Manufacturing",      subsystem: "Transmission",                            priority: "LOW"    },
];

const RECENT_ACTIVITY = [
  { actor: "RI", name: "Rishabh", action: "completed FEA Mesh Setup",        subsystem: "Structures",                              time: "2h ago" },
  { actor: "AT", name: "Atharv",  action: "uploaded Battery Test Report",    subsystem: "EPT (Electrical, Powertrain & Telemetry)", time: "5h ago" },
  { actor: "SA", name: "Sarthak", action: "commented on Motor Controller",   subsystem: "EPT (Electrical, Powertrain & Telemetry)", time: "1d ago" },
  { actor: "AR", name: "Aryan",   action: "pushed new commit",               subsystem: "Machine Learning",                        time: "1d ago" },
];

const DEADLINE_PRIORITY_STYLES: Record<string, string> = {
  HIGH:   "text-[#e8241a] bg-[#1a0804] border-[#5a1a18]",
  MEDIUM: "text-[#f59e0b] bg-[#1a1000] border-[#5a3a00]",
  LOW:    "text-[#8a8a98] bg-[#1a1a1a] border-[#2a2a32]",
};

// ── Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  // In real usage: const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-[#050507]">

      {/* ── Top bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[#111115] bg-[#050507] px-6">
        <div>
          <h1 className="text-[18px] font-semibold tracking-[-0.03em] text-[#e2e2ea]">
            Dashboard
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6a6a78]">
            Welcome back, Ayush
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex h-7 w-48 items-center gap-2 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2.5">
            <Search className="size-3 shrink-0 text-[#6a6a78]" strokeWidth={1.75} />
            <input
              placeholder="Search anything..."
              className="w-full bg-transparent font-mono text-[11px] text-[#c8c8d0] placeholder:text-[#5a5a68] outline-none"
            />
          </div>
          {/* Notifications */}
          <button className="relative flex size-7 items-center justify-center rounded-sm text-[#8a8a98] transition-colors hover:bg-[#0e0e12] hover:text-[#b8b8c4]">
            <Bell className="size-4" strokeWidth={1.75} />
            <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-[#e8241a] font-mono text-[8px] font-bold text-white">
              3
            </span>
          </button>
          {/* User avatar */}
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-sm bg-[#14141a] font-mono text-[10px] font-semibold uppercase text-[#8a8a98]">
              AY
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#c8c8d0]">Ayush</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#6a6a78]">Admin</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="flex flex-1 gap-0">
        <main className="flex-1 min-w-0 p-6 space-y-6">

          {/* ── Stat strip ─────────────────────────────────
              Wire these to: getTeamStats(), getTaskStats() */}
          <div className="grid grid-cols-5 divide-x divide-[#1e1e24] rounded-sm border border-[#1e1e24] bg-[#0a0a0d]">
            {STAT_METRICS.map((m) => (
              <div key={m.label} className="px-5 py-4">
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

          {/* ── Subsystem overview ─────────────────────────
              PROVISION: SubsystemCard accepts `progress`, `taskCount`, `avatars`.
              Wire from: getSubsystemStats() server action.
              The arc ring uses CSS conic-gradient — no chart library needed.
              See SubsystemCard.tsx for the `arc-ring` utility docs.            */}
          <section>
            <p className="section-eyebrow mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a98]">
              Subsystem Overview
            </p>
            <div className="grid grid-cols-4 gap-3 lg:grid-cols-7">
              {SUBSYSTEM_DATA.map((s) => (
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

          {/* ── Task table ─────────────────────────────────
              Wire from: getTasks() server action.
              onComplete → call your updateTaskStatus("DONE") server action.
              onStatusChange → call your updateTaskStatus() server action.   */}
          <section>
            <p className="section-eyebrow mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a98]">
              Subsystem Tasks
            </p>
            <TaskTable
              tasks={SAMPLE_TASKS}
              onComplete={(id) => {
                // TODO: call server action — updateTaskStatus(id, "DONE")
                console.log("complete", id);
              }}
              onStatusChange={(id, status) => {
                // TODO: call server action — updateTaskStatus(id, status)
                console.log("status change", id, status);
              }}
            />
          </section>
        </main>

        {/* ── Right panel ─────────────────────────────────── */}
        <aside className="w-[240px] shrink-0 space-y-0 border-l border-[#111115]">

          {/* Upcoming deadlines */}
          <div className="border-b border-[#111115] p-4">
            <p className="section-eyebrow mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a98]">
              Upcoming Deadlines
            </p>
            <div className="space-y-2">
              {UPCOMING_DEADLINES.map((d, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {/* Date block */}
                  <div className="w-8 shrink-0 text-center">
                    <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-[#6a6a78]">
                      {d.date.split(" ")[0]}
                    </p>
                    <p className="font-mono text-[13px] font-bold text-[#e2e2ea]">
                      {d.date.split(" ")[1]}
                    </p>
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-[#c8c8d0]">
                      {d.title}
                    </p>
                    <p className="font-mono text-[9px] text-[#6a6a78]">
                      {d.subsystem}
                    </p>
                  </div>
                  {/* Priority chip */}
                  <span className={`inline-flex h-4 shrink-0 items-center rounded-sm border px-1 font-mono text-[8px] font-medium uppercase tracking-[0.06em] ${DEADLINE_PRIORITY_STYLES[d.priority]}`}>
                    {d.priority}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#6a6a78] transition-colors hover:text-[#b8b8c4]">
              View Calendar
              <svg className="size-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M2 6h8M7 3l3 3-3 3"/>
              </svg>
            </button>
          </div>

          {/* Recent activity */}
          <div className="p-4">
            <p className="section-eyebrow mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a98]">
              Recent Activity
            </p>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((a, i) => (
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
            <button className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#6a6a78] transition-colors hover:text-[#b8b8c4]">
              View all activity
              <svg className="size-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M2 6h8M7 3l3 3-3 3"/>
              </svg>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
