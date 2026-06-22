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
  params: { id: string };
}) {
  await requireAuth();
  const profile = await getProfile();

  if (!profile) {
    notFound();
  }

  const task = await getTask(params.id);

  if (!task) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
        {task.description && (
          <p className="text-gray-600">{task.description}</p>
        )}
      </div>

      {/* Two-column layout: Timeline (60%) + Metadata (40%) */}
      <div className="grid grid-cols-3 gap-8">
        {/* Timeline - 2/3 width */}
        <div className="col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Activity Timeline
          </h2>
          <TaskTimeline
            updates={task.task_updates || []}
            taskTitle={task.title}
            createdAt={task.created_at}
            createdBy={task.created_by_profile}
          />
        </div>

        {/* Metadata Panel - 1/3 width */}
        <div className="col-span-1">
          <div className="sticky top-4 space-y-6">
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
