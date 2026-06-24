import React from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";

import UpdateForm from "@/components/UpdateForm";
import TaskTimeline from "@/components/TaskTimeline";

export default async function TaskPage({ params }: { params: { taskId: string } }) {
  await requireUser();

  const supabase = await createClient();

  const { data: task } = await supabase.from("tasks").select(`*, milestones:milestones(*), assigned_to:profiles(*)`).eq("id", params.taskId).maybeSingle();

  const { data: updates } = await supabase
    .from("task_updates")
    .select(`*, author:profiles(*), attachments(*)`)
    .eq("task_id", params.taskId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{task?.title || "Task"}</h1>
        <p className="text-muted-foreground">{task?.description}</p>
      </div>

      <div>
        <UpdateForm taskId={params.taskId} />
      </div>

      <div>
        <TaskTimeline updates={updates || []} />
      </div>
    </div>
  );
}
