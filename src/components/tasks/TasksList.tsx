"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskCard } from "@/components/tasks/TaskCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListFilter } from "lucide-react";

type Task = {
  id: string;
  title: string;
  status: string | null;
  priority: string | null;
  deadline: string | null;
  subsystem_id: string | null;
  profiles?: { id: string; full_name: string | null }[] | null;
  subsystems?: { id: string; name: string | null }[] | null;
};

type Subsystem = {
  id: string;
  name: string;
};

type Props = {
  tasks: Task[];
  subsystems: Subsystem[];
};

const taskStatuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "APPROVED", "BLOCKED"];
const taskPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function TasksList({ tasks, subsystems }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [subsystemFilter, setSubsystemFilter] = useState<string>("");

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    if (subsystemFilter && task.subsystem_id !== subsystemFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Tasks</h1>
        <p className="text-sm text-zinc-400">All tasks visible to you.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              {taskStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Priority</label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All priorities</SelectItem>
              {taskPriorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Subsystem</label>
          <Select value={subsystemFilter} onValueChange={setSubsystemFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All subsystems" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All subsystems</SelectItem>
              {subsystems.map((subsystem) => (
                <SelectItem key={subsystem.id} value={subsystem.id}>
                  {subsystem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={ListFilter}
          title="No tasks found"
          description="Try adjusting your filters or check back once new work is assigned."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
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
      )}
    </div>
  );
}
