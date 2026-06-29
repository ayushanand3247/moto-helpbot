import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { getProfile } from "@/lib/auth/get-profile";
import { getProject } from "@/lib/projects/get-project";
import { getMilestones } from "@/lib/milestones/get-milestones";
import { getTasks } from "@/lib/tasks/get-tasks";
import { getActiveMembers } from "@/lib/team/get-active-members";
import { getSubsystems } from "@/lib/subsystems/get-subsystems";
import { ProjectDetail } from "@/components/projects/ProjectDetail";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const profile = await getProfile();
  const { id } = await params;

  // Fetch project — if not found, return 404
  let project;
  try {
    project = await getProject(id);
  } catch {
    notFound();
  }

  const milestones = await getMilestones(id);
  const members = await getActiveMembers();
  const subsystems = await getSubsystems();

  // Fetch tasks for each milestone
  const milestonesWithTasks = await Promise.all(
    milestones.map(async (milestone) => ({
      ...milestone,
      tasks: await getTasks(milestone.id),
    }))
  );

  const canCreate =
    profile?.role === "ADMIN" ||
    profile?.role === "TEAM_MANAGER" ||
    profile?.role === "CAPTAIN" ||
    profile?.role === "SUBSYSTEM_LEAD";

  return (
    <div className="space-y-6 moto-animate-in">
      <ProjectDetail
        project={project}
        milestones={milestonesWithTasks}
        canCreate={canCreate}
        members={members}
        subsystems={subsystems}
      />
    </div>
  );
}
