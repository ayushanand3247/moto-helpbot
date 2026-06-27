"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

const updateUserSubsystemSchema = z.object({
  userId: z.string().uuid(),
  subsystemId: z.string().uuid().nullable(),
});

export async function updateUserSubsystem(
  prevState: unknown,
  formData: FormData
) {
  const supabase = await createClient();

  // Check if the user is logged in and is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to perform this action." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Only administrators can update user subsystems." };
  }

  // Validate form data
  const parsed = updateUserSubsystemSchema.safeParse({
    userId: formData.get("userId"),
    subsystemId: formData.get("subsystemId") === "null" ? null : formData.get("subsystemId"),
  });

  if (!parsed.success) {
    return { error: "Invalid input data." };
  }

  const { userId, subsystemId } = parsed.data;

  // Update the user's subsystem
  const { data, error } = await supabase
    .from("profiles")
    .update({ subsystem_id: subsystemId })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Get subsystem name for logging
  let subsystemName = null;
  if (subsystemId) {
    const { data: subsystemData } = await supabase
      .from("subsystems")
      .select("name")
      .eq("id", subsystemId)
      .single();

    subsystemName = subsystemData?.name || null;
  }

  // Log the activity
  await logActivity(
    user.id,
    "SUBSYSTEM_CHANGED",
    userId,
    "profiles",
    { subsystem_id: subsystemId, subsystem_name: subsystemName }
  );

  // Revalidate the admin page
  revalidatePath("/admin");

  // Return success
  return { success: true };
}
