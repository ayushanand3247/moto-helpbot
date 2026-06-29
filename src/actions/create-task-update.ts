"use server";

import { getMutationClient } from "@/lib/supabase/server-mutation";

export async function createTaskUpdate(data: {
  task_id: string;
  content?: string | null;
  attachments?: Array<{
    file_name: string;
    file_url: string;
    file_type?: string | null;
    file_size_bytes?: number | null;
  }>;
}) {
  const supabase = getMutationClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  // Insert task update
  const { data: updateData, error: updateError } = await supabase
    .from("task_updates")
    .insert([
      {
        task_id: data.task_id,
        content: data.content || null,
        author_id: user.id,
      },
    ])
    .select("id")
    .single();

  if (updateError || !updateData) {
    return { success: false, message: updateError?.message || "Failed to create update" };
  }

  const updateId = updateData.id as string;

  if (data.attachments && data.attachments.length > 0) {
    const attachmentsToInsert = data.attachments.map((a) => ({
      file_name: a.file_name,
      file_url: a.file_url,
      file_type: a.file_type || null,
      file_size_bytes: a.file_size_bytes || null,
      update_id: updateId,
      uploaded_by: user.id,
    }));

    const { error: attachError } = await supabase.from("attachments").insert(attachmentsToInsert);

    if (attachError) {
      return { success: false, message: attachError.message };
    }

    // Log activity for each attachment
    for (const a of attachmentsToInsert) {
      await supabase.from("activity_logs").insert([
        {
          action: "ATTACHMENT_UPLOADED",
          actor_id: user.id,
          entity_type: "task",
          entity_id: data.task_id,
          metadata: { filename: a.file_name },
        },
      ]);
    }
  }

  return { success: true, update_id: updateId };
}
