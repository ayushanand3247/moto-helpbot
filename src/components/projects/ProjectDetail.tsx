"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreateMilestoneDialog,
} from "@/components/milestones/CreateMilestoneDialog";
import {
  MilestoneCard,
} from "@/components/milestones/MilestoneCard";
import {
  CreateTaskDialog,
} from "@/components/tasks/CreateTaskDialog";
import { TaskCard } from "@/components/tasks/TaskCard";

type Props = {
  project: any;
  milestones: any[];
  canCreate: boolean;
  members: any[];
  subsystems: any[];
};

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-800",
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  ARCHIVED: "bg-gray-200 text-gray-600",
};

export function ProjectDetail({
  project,
  milestones,
  canCreate,
  members,
  subsystems,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] =
    useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] =
    useState<string | null>(null);

  const openTaskDialog = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    setTaskDialogOpen(true);
  };

  const closeTaskDialog = () => {
    setSelectedMilestoneId(null);
    setTaskDialogOpen(false);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                {project.title}
              </h1>

              {project.status && (
                <Badge
                  className={statusColors[project.status]}
                >
                  {project.status}
                </Badge>
              )}
            </div>
          </div>

          <p className="text-muted-foreground">
            {project.description ||
              "No description provided"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {project.start_date && (
              <div>
                <p className="text-sm font-semibold">
                  Start Date
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(
                    new Date(project.start_date),
                    "MMM dd, yyyy"
                  )}
                </p>
              </div>
            )}

            {project.target_date && (
              <div>
                <p className="text-sm font-semibold">
                  Target Date
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(
                    new Date(project.target_date),
                    "MMM dd, yyyy"
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Milestones
            </h2>

            {canCreate && (
              <Button
                onClick={() => setDialogOpen(true)}
              >
                Add Milestone
              </Button>
            )}
          </div>

          {milestones.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <h3 className="text-lg font-semibold">
                No milestones yet
              </h3>

              <p className="text-sm text-muted-foreground">
                {canCreate
                  ? "Create your first milestone to get started"
                  : "Check back later for milestones"}
              </p>

              {canCreate && (
                <Button
                  className="mt-4"
                  onClick={() => setDialogOpen(true)}
                >
                  Create First Milestone
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="space-y-3 rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <MilestoneCard
                        id={milestone.id}
                        title={milestone.title}
                        description={
                          milestone.description
                        }
                        status={milestone.status}
                        due_date={milestone.due_date}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">
                        Tasks
                      </h4>

                      {canCreate && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openTaskDialog(
                              milestone.id
                            )
                          }
                        >
                          Add Task
                        </Button>
                      )}
                    </div>

                    {milestone.tasks &&
                    milestone.tasks.length > 0 ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {milestone.tasks.map(
                          (task: any) => (
                            <TaskCard
                              key={task.id}
                              id={task.id}
                              title={task.title}
                              status={task.status}
                              priority={task.priority}
                              assignee={
                                task.profiles
                                  ?.full_name
                              }
                              deadline={
                                task.deadline
                              }
                              subsystem={
                                task.subsystems
                                  ?.name
                              }
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No tasks yet
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateMilestoneDialog
        projectId={project.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {selectedMilestoneId && (
        <CreateTaskDialog
          milestoneId={selectedMilestoneId}
          projectId={project.id}
          open={taskDialogOpen}
          onOpenChange={closeTaskDialog}
          members={members}
          subsystems={subsystems}
        />
      )}
    </>
  );
}
