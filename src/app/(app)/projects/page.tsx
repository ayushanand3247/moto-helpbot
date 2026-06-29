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
    profile?.role === "TEAM_MANAGER" ||
    profile?.role === "CAPTAIN" ||
    profile?.role === "SUBSYSTEM_LEAD";

  return (
    <div className="space-y-8 moto-animate-in">
      <ProjectsList
        projects={projects || []}
        canCreate={canCreate}
      />
    </div>
  );
}
