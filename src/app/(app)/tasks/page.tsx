import { requireAuth } from "@/lib/auth/require-auth";
import { getAllTasks } from "@/lib/tasks/get-all-tasks";
import { getSubsystems } from "@/lib/subsystems/get-subsystems";
import { TasksList } from "@/components/tasks/TasksList";

export default async function TasksPage() {
  await requireAuth();

  const tasks = await getAllTasks();
  const subsystems = await getSubsystems();

  return (
    <div className="space-y-8">
      <TasksList tasks={tasks} subsystems={subsystems} />
    </div>
  );
}
