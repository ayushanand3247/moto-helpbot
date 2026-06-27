"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const createInvitationSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2),
  role: z.enum(["ADMIN", "BOARD", "MEMBER"]),
  subsystem_id: z.string().uuid(),
  position: z.string().min(1),
});

export async function createInvitation(
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
    return { error: "Only administrators can send invitations." };
  }

  // Validate form data
  const parsed = createInvitationSchema.safeParse({
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    role: formData.get("role"),
    subsystem_id: formData.get("subsystem_id"),
    position: formData.get("position"),
  });

  if (!parsed.success) {
    return { error: "Invalid input data." };
  }

  const { email, full_name, role, subsystem_id, position } = parsed.data;

  // Generate a secure random token
  const token = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);

  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Insert the invitation
  const { data: invitation, error } = await supabase
    .from("invitations")
    .insert({
      email,
      full_name,
      role,
      subsystem_id,
      position,
      invited_by: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Log the activity
  await logActivity(
    user.id,
    "USER_INVITED",
    invitation.id,
    "invitations",
    { email, role: invitation.role }
  );

  // Revalidate the admin page
  revalidatePath("/admin");

  // Redirect to the admin page to show the new invitation
  redirect("/admin");
}
