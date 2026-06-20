"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CreateProjectDialog,
} from "@/components/projects/CreateProjectDialog";
import {
  ProjectCard,
} from "@/components/projects/ProjectCard";

type Props = {
  projects: any[];
  canCreate: boolean;
};

export function ProjectsList({
  projects,
  canCreate,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Projects
          </h1>

          <p className="text-muted-foreground">
            Manage all projects and milestones.
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={() => setDialogOpen(true)}
          >
            New Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <h3 className="text-lg font-semibold">
            No projects yet
          </h3>

          <p className="text-sm text-muted-foreground">
            {canCreate
              ? "Create your first project to get started"
              : "Check back later for projects"}
          </p>

          {canCreate && (
            <Button
              className="mt-4"
              onClick={() => setDialogOpen(true)}
            >
              Create First Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              status={project.status}
              target_date={project.target_date}
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
