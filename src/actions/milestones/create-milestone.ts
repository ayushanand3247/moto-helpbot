"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMutationClient } from "@/lib/supabase/server-mutation";
import { getUser } from "@/lib/auth/get-user";

type CreateMilestoneInput = {
  projectId: string;
  title: string;
  description?: string;
  due_date?: string;
};

export async function createMilestone(
  input: CreateMilestoneInput
) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify the user has permission to create milestones
  const supabase = getMutationClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["ADMIN", "TEAM_MANAGER", "CAPTAIN", "SUBSYSTEM_LEAD"].includes(profile.role)) {
    throw new Error("Insufficient permissions to create milestones");
  }

  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Title is required");
  }

  const { data, error } = await supabase
    .from("milestones")
    .insert({
      project_id: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      due_date: input.due_date || null,
      status: "NOT_STARTED",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${input.projectId}`);

  return data;
}
