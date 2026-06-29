"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  CreateProjectDialog,
} from "@/components/projects/CreateProjectDialog";
import {
  ProjectCard,
} from "@/components/projects/ProjectCard";
import { Plus } from "lucide-react";

type Props = {
  projects: any[];
  canCreate: boolean;
};

export function ProjectsList({
  projects: initialProjects,
  canCreate,
}: Props) {
  const [projects, setProjects] = useState(initialProjects);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleProjectDeleted = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all projects and milestones.
          </p>
        </div>

        {canCreate && (
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="size-3.5" />
            New Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/40 py-16">
          <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Plus className="size-4 text-muted-foreground/70" />
          </div>
          <h3 className="text-sm font-medium text-foreground/80">
            No projects yet
          </h3>

          <p className="text-xs text-muted-foreground/70 mt-1">
            {canCreate
              ? "Create your first project to get started"
              : "Check back later for projects"}
          </p>

          {canCreate && (
            <Button
              size="sm"
              className="mt-4"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="size-3.5" />
              Create First Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 moto-stagger">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              status={project.status}
              target_date={project.target_date}
              total_tasks={project.total_tasks}
              completed_tasks={project.completed_tasks}
              onDelete={() => handleProjectDeleted(project.id)}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
