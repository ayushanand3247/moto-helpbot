"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskCard } from "@/components/tasks/TaskCard";

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
  tasks,
  subsystems,
}: Props) {
  const [statusFilter, setStatusFilter] =
    useState<string>("");
  const [priorityFilter, setPriorityFilter] =
    useState<string>("");
  const [subsystemFilter, setSubsystemFilter] =
    useState<string>("");

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tasks</h1>

        <p className="text-muted-foreground">
          All tasks visible to you.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Status
          </label>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
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
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Priority
          </label>

          <Select
            value={priorityFilter}
            onValueChange={setPriorityFilter}
          >
            <SelectTrigger>
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

        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Subsystem
          </label>

          <Select
            value={subsystemFilter}
            onValueChange={setSubsystemFilter}
          >
            <SelectTrigger>
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
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <h3 className="text-lg font-semibold">
            No tasks found
          </h3>

          <p className="text-sm text-muted-foreground">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              status={task.status}
              priority={task.priority}
              assignee={task.profiles?.full_name}
              deadline={task.deadline}
              subsystem={task.subsystems?.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
