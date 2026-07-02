"use server";

import { revalidatePath } from "next/cache";
import { getMutationClient } from "@/lib/supabase/server-mutation";
import { getProfile } from "@/lib/auth/get-profile";
import { canManageProjects } from "@/lib/roles";

type CreateProjectInput = {
  title: string;
  description?: string;
  status?: "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  start_date?: string;
  target_date?: string;
};

export async function createProject(
  input: CreateProjectInput
) {
  const profile = await getProfile();

  if (!profile) {
    throw new Error("Unauthorized");
  }

  // Only board+ can create projects
  if (!canManageProjects(profile.role)) {
    throw new Error("Insufficient permissions to create projects");
  }

  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Title is required");
  }

  const supabase = getMutationClient();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: input.status || "PLANNING",
      start_date: input.start_date || null,
      target_date: input.target_date || null,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");

  return data;
}
