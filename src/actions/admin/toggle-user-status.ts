"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

const toggleUserStatusSchema = z.object({
  userId: z.string().uuid(),
  isActive: z.boolean(),
});

export async function toggleUserStatus(
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
    return { error: "Only administrators can toggle user active status." };
  }

  // Validate form data
  const parsed = toggleUserStatusSchema.safeParse({
    userId: formData.get("userId"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { error: "Invalid input data." };
  }

  const { userId, isActive } = parsed.data;

  // Update user's status
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  // Log the activity
  await logActivity(
    user.id,
    isActive ? "USER_REACTIVATED" : "USER_DEACTIVATED",
    userId,
    "profiles",
    { is_active: isActive }
  );

  // Revalidate the admin dashboard
  revalidatePath("/admin");

  return { success: true };
}

