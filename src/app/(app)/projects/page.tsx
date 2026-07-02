import { getProfile } from "@/lib/auth/get-profile";
import { getProjects } from "@/lib/projects/get-projects";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { canManageProjects } from "@/lib/roles";

export default async function ProjectsPage() {
  // Fetch profile and projects in parallel (single client each)
  const [profile, projects] = await Promise.all([
    getProfile(),
    getProjects(),
  ]);

  const canCreate = canManageProjects(profile?.role);

  return (
    <div className="space-y-8 moto-animate-in">
      <ProjectsList
        projects={projects || []}
        canCreate={canCreate}
      />
    </div>
  );
}
