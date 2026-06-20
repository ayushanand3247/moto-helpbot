import { requireAuth } from "@/lib/auth/require-auth";
import { getProfile } from "@/lib/auth/get-profile";
import { getProjects } from "@/lib/projects/get-projects";
import { ProjectsList } from "@/components/projects/ProjectsList";

export default async function ProjectsPage() {
  await requireAuth();
  const profile = await getProfile();
  const projects = await getProjects();

  const canCreate =
    profile?.role === "ADMIN" ||
    profile?.role === "BOARD";

  return (
    <div className="space-y-8">
      <ProjectsList
        projects={projects || []}
        canCreate={canCreate}
      />
    </div>
  );
}
