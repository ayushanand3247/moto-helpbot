"use client";

import { useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskCard } from "@/components/tasks/TaskCard";
import { ListChecks } from "lucide-react";

type Props = {
  tasks: any[];
  subsystems: any[];
};

const taskStatuses = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "APPROVED",
  "BLOCKED",
];
const taskPriorities = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

export function TasksList({
  tasks: initialTasks,
  subsystems,
}: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [statusFilter, setStatusFilter] =
    useState<string>("");
  const [priorityFilter, setPriorityFilter] =
    useState<string>("");
  const [subsystemFilter, setSubsystemFilter] =
    useState<string>("");

  const handleTaskDeleted = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (
      statusFilter &&
      task.status !== statusFilter
    ) {
      return false;
    }

    if (
      priorityFilter &&
      task.priority !== priorityFilter
    ) {
      return false;
    }

    if (
      subsystemFilter &&
      task.subsystem_id !== subsystemFilter
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-7">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Tasks
        </h1>
        <p className="text-sm text-muted-foreground">
          All tasks visible to you.
        </p>
      </div>

      {/* Filter controls — precision instrument panel */}
      <div className="flex gap-3 items-end">
        <div className="space-y-1.5">
          <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">
            Status
          </label>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="">
                All Status
              </SelectItem>

              {taskStatuses.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                >
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">
            Priority
          </label>
          <Select
            value={priorityFilter}
            onValueChange={setPriorityFilter}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="">
                All Priority
              </SelectItem>

              {taskPriorities.map((priority) => (
                <SelectItem
                  key={priority}
                  value={priority}
                >
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">
            Subsystem
          </label>
          <Select
            value={subsystemFilter}
            onValueChange={setSubsystemFilter}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue placeholder="All Subsystem" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="">
                All Subsystem
              </SelectItem>

              {subsystems.map((subsystem) => (
                <SelectItem
                  key={subsystem.id}
                  value={subsystem.id}
                >
                  {subsystem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/40 py-16">
          <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <ListChecks className="size-4 text-muted-foreground/70" />
          </div>
          <h3 className="text-sm font-medium text-foreground/80">
            No tasks found
          </h3>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 moto-stagger">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              status={task.status}
              priority={task.priority}
              assignee={task.profiles?.full_name ?? task.assigned_to_profile?.full_name}
              assignees={task.assignees}
              deadline={task.deadline}
              subsystem={task.subsystems?.name}
              onDelete={() => handleTaskDeleted(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
