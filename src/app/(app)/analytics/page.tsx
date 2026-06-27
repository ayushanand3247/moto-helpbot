import { requireBoard } from "@/lib/auth/require-board";
import {
  getOverallTaskStats,
  getSubsystemProgress,
  getMemberWorkload,
  getOverdueTasks,
} from "@/lib/analytics/queries";
import { SummaryCards } from "@/components/analytics/SummaryCards";
import { SubsystemProgress } from "@/components/analytics/SubsystemProgress";
import { MemberWorkloadTable } from "@/components/analytics/MemberWorkloadTable";
import { OverdueTasksList } from "@/components/analytics/OverdueTasksList";

export const metadata = {
  title: "Analytics | MotoManipal",
  description: "Team performance analytics and task progress overview",
};

export default async function AnalyticsPage() {
  await requireBoard();

  const [stats, subsystemProgress, memberWorkload, overdueTasks] =
    await Promise.all([
      getOverallTaskStats(),
      getSubsystemProgress(),
      getMemberWorkload(),
      getOverdueTasks(),
    ]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          Analytics
        </h1>
        <p className="text-sm text-zinc-400">
          Team performance, task health, and subsystem progress.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Overview
        </h2>
        <SummaryCards stats={stats} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Subsystem Progress
        </h2>
        <SubsystemProgress subsystems={subsystemProgress} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Member Workload
          </h2>
          <MemberWorkloadTable members={memberWorkload} />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
            Overdue Tasks
          </h2>
          <OverdueTasksList tasks={overdueTasks} />
        </section>
      </div>
    </div>
  );
}
