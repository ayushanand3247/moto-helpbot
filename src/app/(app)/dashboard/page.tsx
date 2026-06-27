import { getProfile } from "@/lib/auth/get-profile";
import { UserCard } from "@/components/dashboard/UserCard";
import { RoleCard } from "@/components/dashboard/RoleCard";
import { SubsystemCard } from "@/components/dashboard/SubsystemCard";
import { TaskCountCard } from "@/components/dashboard/TaskCountCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Dashboard | MotoManipal",
};

export default async function DashboardPage() {
  const profile = await getProfile();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-400">Welcome back to MotoManipal.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <UserCard name={profile.full_name ?? "Unknown"} />
        <RoleCard role={profile.role} />
        <SubsystemCard subsystem={profile.subsystems?.name ?? "Unassigned"} />
        <TaskCountCard count={0} />
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Recent Activity
        </h2>
        <Suspense
          fallback={
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          }
        >
          <ActivityFeed />
        </Suspense>
      </section>
    </div>
  );
}
