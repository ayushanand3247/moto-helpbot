"use server";

import { revalidatePath } from "next/cache";
import { getMutationClient } from "@/lib/supabase/server-mutation";
import { getProfile } from "@/lib/auth/get-profile";

export async function updateProject(projectId: string, data: {
  title?: string;
  description?: string;
  status?: string;
  target_date?: string | null;
  created_by?: string;
}) {
  const admin = await getProfile();
  if (!admin || admin.role !== "ADMIN") return { error: "Unauthorized" };

  const supabase = getMutationClient();
  const { error } = await supabase.from("projects").update(data).eq("id", projectId);
  if (error) return { error: error.message };

  if (data.status) {
    await supabase.from("activity_logs").insert({
      action: "PROJECT_STATUS_CHANGED",
      actor_id: admin.id,
      entity_type: "PROJECT",
      entity_id: projectId,
      metadata: { new_status: data.status },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/projects");
  return { success: true };
}

export async function archiveProject(projectId: string) {
  return updateProject(projectId, { status: "ARCHIVED" });
}

export async function reopenProject(projectId: string) {
  return updateProject(projectId, { status: "ACTIVE" });
}
