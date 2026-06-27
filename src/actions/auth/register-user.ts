"use server";

import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/permissions";
import { redirect } from "next/navigation";

const registerUserSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

export async function registerUser(prevState: any, formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  // Validate fields
  const parsed = registerUserSchema.safeParse({ token, password, fullName });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input data." };
  }

  // 1. Fetch invitation details using admin client
  const { data: invitation, error: inviteError } = await adminClient
    .from("invitations")
    .select("*")
    .eq("token", token)
    .single();

  if (inviteError || !invitation) {
    return { error: "Invitation not found." };
  }

  // 2. Check if already accepted
  if (invitation.accepted_at) {
    return { error: "This invitation has already been accepted." };
  }

  // 3. Check if expired
  const isExpired = new Date(invitation.expires_at) < new Date();
  if (isExpired) {
    return { error: "This invitation has expired." };
  }

  // 4. Create user in Supabase Auth (confirming email immediately)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: invitation.email,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create user in Auth system." };
  }

  const newUser = authData.user;

  // 5. Upsert the profile row (handles case where DB trigger auto-created profile)
  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert({
      id: newUser.id,
      email: invitation.email,
      full_name: fullName,
      role: invitation.role,
      subsystem_id: invitation.subsystem_id,
      position: invitation.position,
      is_active: true,
      joined_year: new Date().getFullYear(),
    });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    // Note: User was created in auth, so we attempt to proceed or report it
  }

  // 6. Mark invitation accepted
  const { error: acceptError } = await adminClient
    .from("invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  if (acceptError) {
    console.error("Error marking invitation accepted:", acceptError);
  }

  // 7. Log activity
  await logActivity(
    newUser.id,
    "USER_REGISTERED",
    newUser.id,
    "profiles",
    { email: invitation.email }
  );

  // 8. Sign user in using client client to write session cookies
  const userClient = await createClient();
  const { error: signInError } = await userClient.auth.signInWithPassword({
    email: invitation.email,
    password: password,
  });

  if (signInError) {
    return { error: `Account created successfully, but auto-login failed: ${signInError.message}. Please login manually.` };
  }

  // 9. Redirect to dashboard
  redirect("/dashboard");
}

