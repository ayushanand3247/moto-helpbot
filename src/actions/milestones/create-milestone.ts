"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Title is required");
  }

  const supabase = await createClient();

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
