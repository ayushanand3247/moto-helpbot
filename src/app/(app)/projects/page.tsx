import { getProfile } from "@/lib/auth/get-profile";
import { getProjects } from "@/lib/projects/get-projects";
import { ProjectsList } from "@/components/projects/ProjectsList";

export default async function ProjectsPage() {
  // Fetch profile and projects in parallel (single client each)
  const [profile, projects] = await Promise.all([
    getProfile(),
    getProjects(),
  ]);

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
