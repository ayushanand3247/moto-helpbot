import { getProfile } from "@/lib/auth/get-profile";

import { UserCard } from "@/components/dashboard/UserCard";
import { RoleCard } from "@/components/dashboard/RoleCard";
import { SubsystemCard } from "@/components/dashboard/SubsystemCard";
import { TaskCountCard } from "@/components/dashboard/TaskCountCard";

export default async function DashboardPage() {
  const profile = await getProfile();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-muted-foreground">
          Welcome back to MotoManipal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <UserCard
          name={profile.full_name ?? "Unknown"}
        />

        <RoleCard
          role={profile.role}
        />

        <SubsystemCard
          subsystem={
            profile.subsystems?.name ??
            "Unassigned"
          }
        />

        <TaskCountCard count={0} />
      </div>
    </div>
  );
}