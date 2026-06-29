import DashboardClient from "@/components/DashboardClient";
import { getSubsystemStats } from "@/lib/actions/subsystems";
import {
  getTasks,
  getUpcomingDeadlines,
  getRecentActivity,
  getDashboardStats,
} from "@/lib/actions/dashboard";
import { getRecentNotifications } from "@/lib/actions/notifications";
import { getProfile } from "@/lib/auth/get-profile";

export default async function DashboardPage() {
  const profile = await getProfile();

  const [stats, subsystems, tasks, deadlines, activity, notifications] =
    await Promise.all([
      getDashboardStats(),
      getSubsystemStats(),
      getTasks({ limit: 50 }),
      getUpcomingDeadlines(5),
      getRecentActivity(4),
      getRecentNotifications(10),
    ]);

  return (
    <DashboardClient
      initialTasks={tasks}
      subsystemStats={subsystems as any}
      notifications={notifications}
      currentUser={
        profile
          ? {
              id: profile.id,
              name: profile.full_name,
              role: profile.role,
              subsystem: profile.subsystems?.name,
            }
          : null
      }
      stats={stats}
      deadlines={deadlines}
      activity={activity}
    />
  );
}
