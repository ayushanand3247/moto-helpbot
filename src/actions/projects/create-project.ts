"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";

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
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!input.title || input.title.trim().length === 0) {
    throw new Error("Title is required");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: input.status || "PLANNING",
      start_date: input.start_date || null,
      target_date: input.target_date || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");

  return data;
}
