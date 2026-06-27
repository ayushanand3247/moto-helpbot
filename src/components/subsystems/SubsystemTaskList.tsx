import { TaskCard } from "@/components/tasks/TaskCard";
import type { SubsystemTask } from "@/lib/subsystems/types";

type Props = {
  tasks: SubsystemTask[];
};

export function SubsystemTaskList({ tasks }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <h3 className="text-lg font-semibold">No tasks</h3>
        <p className="mt-1 text-sm text-zinc-400">No tasks have been assigned to this subsystem yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          id={task.id}
          title={task.title}
          status={task.status}
          priority={task.priority}
          assignee={task.profiles?.[0]?.full_name ?? null}
          deadline={task.deadline}
          subsystem={task.subsystems?.[0]?.name ?? null}
        />
      ))}
    </div>
  );
}
