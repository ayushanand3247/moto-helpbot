"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badges";
import { CreateMilestoneDialog } from "@/components/milestones/CreateMilestoneDialog";
import { MilestoneCard } from "@/components/milestones/MilestoneCard";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { TaskCard } from "@/components/tasks/TaskCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClipboardList } from "lucide-react";

type Task = {
  id: string;
  title: string;
  status: string | null;
  priority: string | null;
  deadline: string | null;
  profiles?: { id: string; full_name: string | null }[] | null;
  subsystems?: { id: string; name: string | null }[] | null;
};

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  due_date: string | null;
  tasks?: Task[];
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  start_date: string | null;
  target_date: string | null;
};

type Member = { id: string; full_name: string };
type Subsystem = { id: string; name: string };

type Props = {
  project: Project;
  milestones: Milestone[];
  canCreate: boolean;
  members: Member[];
  subsystems: Subsystem[];
};

export function ProjectDetail({ project, milestones, canCreate, members, subsystems }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);

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
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{project.title}</h1>
              {project.status ? <StatusBadge value={project.status} /> : null}
            </div>
          </div>

          <p className="text-zinc-400">{project.description || "No description provided"}</p>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {project.start_date ? (
              <div>
                <p className="text-sm font-semibold text-zinc-200">Start Date</p>
                <p className="text-sm text-zinc-400">{format(new Date(project.start_date), "MMM dd, yyyy")}</p>
              </div>
            ) : null}

            {project.target_date ? (
              <div>
                <p className="text-sm font-semibold text-zinc-200">Target Date</p>
                <p className="text-sm text-zinc-400">{format(new Date(project.target_date), "MMM dd, yyyy")}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Milestones</h2>
            {canCreate ? <Button onClick={() => setDialogOpen(true)}>Add Milestone</Button> : null}
          </div>

          {milestones.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No milestones yet"
              description={canCreate ? "Create your first milestone to get started." : "Check back later for milestones."}
              action={canCreate ? <Button onClick={() => setDialogOpen(true)}>Create First Milestone</Button> : undefined}
            />
          ) : (
            <div className="space-y-6">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                  <MilestoneCard
                    id={milestone.id}
                    title={milestone.title}
                    description={milestone.description}
                    status={milestone.status}
                    due_date={milestone.due_date}
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-zinc-200">Tasks</h4>
                      {canCreate ? (
                        <Button size="sm" variant="outline" onClick={() => openTaskDialog(milestone.id)}>
                          Add Task
                        </Button>
                      ) : null}
                    </div>

                    {milestone.tasks && milestone.tasks.length > 0 ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {milestone.tasks.map((task) => (
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
                    ) : (
                      <p className="text-sm text-zinc-400">No tasks yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateMilestoneDialog projectId={project.id} open={dialogOpen} onOpenChange={setDialogOpen} />

      {selectedMilestoneId ? (
        <CreateTaskDialog
          milestoneId={selectedMilestoneId}
          projectId={project.id}
          open={taskDialogOpen}
          onOpenChange={closeTaskDialog}
          members={members}
          subsystems={subsystems}
        />
      ) : null}
    </>
  );
}
