import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { getProfile } from "@/lib/auth/get-profile";
import { getTask } from "@/lib/tasks/get-task";
import { TaskTimeline } from "@/components/tasks/TaskTimeline";
import { MetadataPanel } from "@/components/tasks/MetadataPanel";
import { UpdateForm } from "@/components/tasks/UpdateForm";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const profile = await getProfile();

  if (!profile) {
    notFound();
  }

  const { id } = await params;
  const task = await getTask(id);

  if (!task) {
    notFound();
  }

  return (
    <div className="space-y-5 moto-animate-in">
      {/* Header */}
      <div className="border-b border-border/30 pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground mb-1">
          {task.title}
        </h1>
        {task.description && (
          <p className="text-sm text-muted-foreground/80">
            {task.description}
          </p>
        )}
      </div>

      {/* Two-column layout: Timeline (60%) + Metadata (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline — 2/3 width */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-4">
            Activity Timeline
          </h2>
          <TaskTimeline
            updates={task.task_updates || []}
            taskTitle={task.title}
            createdAt={task.created_at}
            createdBy={task.created_by_profile}
          />
        </div>

        {/* Metadata Panel — 1/3 width */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            <MetadataPanel task={task} />

            {/* Update Form */}
            <UpdateForm
              taskId={task.id}
              taskStatus={task.status || "TODO"}
              assignedTo={task.assigned_to}
              userRole={profile.role}
              userId={profile.id}
              createdBy={task.created_by}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
