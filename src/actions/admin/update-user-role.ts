"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["ADMIN", "BOARD", "MEMBER"]),
});

export async function updateUserRole(
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
    return { error: "Only administrators can update user roles." };
  }

  // Validate form data
  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "Invalid input data." };
  }

  const { userId, role } = parsed.data;

  // Update the user's role
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Log the activity
  await logActivity(
    user.id,
    "ROLE_CHANGED",
    userId,
    "profiles",
    { role }
  );

  // Revalidate the admin page
  revalidatePath("/admin");

  // Return success
  return { success: true };
}
