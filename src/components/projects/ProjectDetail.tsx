"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { Plus, FolderKanban, Calendar, Target, Trash2, Check } from "lucide-react";

type Props = {
  project: any;
  milestones: any[];
  canCreate: boolean;
  members: any[];
  subsystems: any[];
};

const statusVariant: Record<string, "outline" | "success" | "secondary" | "default"> = {
  PLANNING: "outline",
  ACTIVE: "success",
  COMPLETED: "secondary",
  ARCHIVED: "default",
};

export function ProjectDetail({
  project: initialProject,
  milestones: initialMilestones,
  canCreate,
  members,
  subsystems,
}: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] =
    useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] =
    useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Local state for milestones so we can remove tasks immediately on delete
  const [milestones, setMilestones] = useState(initialMilestones);

  const handleTaskDeleted = useCallback((taskId: string) => {
    setMilestones((prev) =>
      prev.map((m) => ({
        ...m,
        tasks: (m.tasks || []).filter((t: any) => t.id !== taskId),
      }))
    );
  }, []);

  // Recalculate progress from local milestones state
  const { totalTasks, completedTasks, percentage, isCompleted } = useMemo(() => {
    const allTasks = milestones.flatMap((m) => m.tasks || []);
    const total = allTasks.length;
    const completed = allTasks.filter((t: any) => t.status === "APPROVED").length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalTasks: total,
      completedTasks: completed,
      percentage: pct,
      isCompleted: pct === 100 && total > 0,
    };
  }, [milestones]);

  // Keep project in sync with recalculated progress
  const project = {
    ...initialProject,
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
  };

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
      <div className="space-y-6">
        {/* Project header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FolderKanban className="size-4 text-moto-cyan/50" />
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  {project.title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <Badge variant="success" className="gap-1">
                    <Check className="size-2.5" />
                    Completed
                  </Badge>
                ) : project.status ? (
                  <Badge variant={statusVariant[project.status] ?? "secondary"}>
                    {project.status}
                  </Badge>
                ) : null}
              </div>
            </div>
            <button
              onClick={() => setDeleteOpen(true)}
              className="shrink-0 rounded-sm border border-[#2a2a32] p-2 text-muted-foreground/70 transition-colors hover:bg-[#e8241a]/10 hover:border-[#e8241a]/30 hover:text-[#e8241a]"
              title="Delete project"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            {project.description ||
              "No description provided"}
          </p>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">
                {totalTasks === 0
                  ? "No tasks yet"
                  : `${completedTasks} / ${totalTasks} Tasks Completed`}
              </span>
              <span className="font-mono text-[10px] font-medium text-foreground/70">
                {percentage}%
              </span>
            </div>
            <ProgressBar percentage={percentage} />
          </div>

          {/* Date metadata — engineering log style */}
          <div className="flex gap-6">
            {project.start_date && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3 text-muted-foreground/70" />
                <span className="text-muted-foreground/70">Start Date</span>
                <span className="moto-number">
                  {format(
                    new Date(project.start_date),
                    "MMM dd, yyyy"
                  )}
                </span>
              </div>
            )}

            {project.target_date && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Target className="size-3 text-muted-foreground/70" />
                <span className="text-muted-foreground/70">Target Date</span>
                <span className="moto-number">
                  {format(
                    new Date(project.target_date),
                    "MMM dd, yyyy"
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Milestones section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
              Milestones
            </h2>

            {canCreate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="size-3.5" />
                Add Milestone
              </Button>
            )}
          </div>

          {milestones.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/40 py-12">
              <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Plus className="size-4 text-muted-foreground/70" />
              </div>
              <h3 className="text-sm font-medium text-foreground/80">
                No milestones yet
              </h3>

              <p className="text-xs text-muted-foreground/70 mt-1">
                {canCreate
                  ? "Create your first milestone to get started"
                  : "Check back later for milestones"}
              </p>

              {canCreate && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="size-3.5" />
                  Create First Milestone
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="rounded-lg border border-border/40 bg-card/50 p-4 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <MilestoneCard
                        id={milestone.id}
                        title={milestone.title}
                        description={milestone.description}
                        status={milestone.status}
                        due_date={milestone.due_date}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                        Tasks
                      </h4>

                      {canCreate && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            openTaskDialog(milestone.id)
                          }
                        >
                          <Plus className="size-3" />
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
                              assignees={
                                task.assignees
                              }
                              deadline={
                                task.deadline
                              }
                              subsystem={
                                task.subsystems
                                  ?.name
                              }
                              onDelete={() => handleTaskDeleted(task.id)}
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/70 py-2">
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

      <DeleteProjectDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        projectId={project.id}
        projectTitle={project.title}
        onSuccess={() => router.push("/projects")}
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
