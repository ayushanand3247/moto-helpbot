"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FolderPlus } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  target_date: string | null;
};

type Props = {
  projects: Project[];
  canCreate: boolean;
};

export function ProjectsList({ projects, canCreate }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Projects</h1>
          <p className="text-sm text-zinc-400">Manage all projects and milestones.</p>
        </div>

        {canCreate ? (
          <Button onClick={() => setDialogOpen(true)}>New Project</Button>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="No projects yet"
          description={canCreate ? "Create your first project to get the team moving." : "Check back later for projects."}
          action={canCreate ? <Button onClick={() => setDialogOpen(true)}>Create First Project</Button> : undefined}
        />
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

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}

