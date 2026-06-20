import { requireAuth } from "@/lib/auth/require-auth";
import { getProfile } from "@/lib/auth/get-profile";
import { getProject } from "@/lib/projects/get-project";
import { getMilestones } from "@/lib/milestones/get-milestones";
import { ProjectDetail } from "@/components/projects/ProjectDetail";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const profile = await getProfile();
  const { id } = await params;

  const project = await getProject(id);
  const milestones = await getMilestones(id);

  const canCreate =
    profile?.role === "ADMIN" ||
    profile?.role === "BOARD";

  return (
    <div className="space-y-8">
      <ProjectDetail
        project={project}
        milestones={milestones}
        canCreate={canCreate}
      />
    </div>
  );
}
