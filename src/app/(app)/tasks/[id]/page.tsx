import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { getProfile } from "@/lib/auth/get-profile";
import { getTask } from "@/lib/tasks/get-task";
import { TaskTimeline } from "@/components/tasks/TaskTimeline";
import { MetadataPanel } from "@/components/tasks/MetadataPanel";
import { UpdateForm } from "@/components/tasks/UpdateForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="space-y-2 border-b border-zinc-800 pb-8">
        <p className="font-mono text-xs text-zinc-500">{task.id.slice(0, 8)}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          {task.title}
        </h1>
        {task.description && (
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
            {task.description}
          </p>
        )}
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <section className="space-y-6" aria-labelledby="task-activity-heading">
            <h2
              id="task-activity-heading"
              className="text-sm font-medium uppercase tracking-wider text-zinc-500"
            >
              Activity
            </h2>
            <TaskTimeline
              updates={task.task_updates || []}
              taskTitle={task.title}
              createdAt={task.created_at}
              createdBy={task.created_by_profile}
            />
          </section>

          <UpdateForm
            taskId={task.id}
            taskStatus={task.status || "TODO"}
            assignedTo={task.assigned_to}
            userRole={profile.role}
            userId={profile.id}
            createdBy={task.created_by}
          />
        </div>

        <aside className="min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto" aria-label="Task details">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-400">
                Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MetadataPanel task={task} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}


