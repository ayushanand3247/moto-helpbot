import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { requireAuth } from "@/lib/auth/require-auth";
import {
  getSubsystem,
  getSubsystemMembers,
  getSubsystemTasks,
} from "@/lib/subsystems/queries";
import { MemberCards } from "@/components/subsystems/MemberCards";
import { SubsystemTaskList } from "@/components/subsystems/SubsystemTaskList";
import { Badge } from "@/components/ui/badge";

interface SubsystemPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SubsystemPage({ params }: SubsystemPageProps) {
  await requireAuth();
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const { slug } = await params;

  const subsystem = await getSubsystem(slug);
  if (!subsystem) notFound();

  if (
    profile.role === "MEMBER" &&
    profile.subsystems?.id !== subsystem.id
  ) {
    redirect("/dashboard");
  }

  const [members, tasks] = await Promise.all([
    getSubsystemMembers(subsystem.id),
    getSubsystemTasks(subsystem.id),
  ]);

  const color = subsystem.color || "#71717a";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12">
      <div className="space-y-3 border-b border-zinc-800 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            {subsystem.name}
          </h1>
          <Badge variant="secondary">Subsystem</Badge>
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
          <span>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Members
        </h2>
        <MemberCards members={members} subsystemColor={subsystem.color} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Tasks
        </h2>
        <SubsystemTaskList tasks={tasks} />
      </section>
    </div>
  );
}
