import { getAllTasks } from "@/lib/tasks/get-all-tasks";
import { getSubsystems } from "@/lib/subsystems/get-subsystems";
import { TasksList } from "@/components/tasks/TasksList";

export default async function TasksPage() {
  const [tasks, subsystems] = await Promise.all([
    getAllTasks(),
    getSubsystems(),
  ]);

  return (
    <div className="space-y-8 moto-animate-in">
      <TasksList tasks={tasks} subsystems={subsystems} />
    </div>
  );
}
