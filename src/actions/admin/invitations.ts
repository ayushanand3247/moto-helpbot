"use server";

import { revalidatePath } from "next/cache";
import { getMutationClient } from "@/lib/supabase/server-mutation";
import { getProfile } from "@/lib/auth/get-profile";
import { canManageInvitations, isAdmin } from "@/lib/roles";

export async function sendInvitation(data: {
  email: string;
  full_name: string;
  role: string;
  subsystem_id?: string;
}) {
  const admin = await getProfile();
  if (!admin || !canManageInvitations(admin.role)) return { error: "Unauthorized" };

  const supabase = getMutationClient();

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600000).toISOString();

  const { error } = await supabase.from("invitations").insert({
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    subsystem_id: data.subsystem_id || null,
    token,
    expires_at: expiresAt,
    invited_by: admin.id,
  });

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    action: "INVITATION_SENT",
    actor_id: admin.id,
    entity_type: "INVITATION",
    metadata: { email: data.email },
  });

  revalidatePath("/admin");
  return { success: true, token };
}

export async function cancelInvitation(invitationId: string) {
  const admin = await getProfile();
  if (!admin || !canManageInvitations(admin.role)) return { error: "Unauthorized" };

  const supabase = getMutationClient();
  const { error } = await supabase.from("invitations").delete().eq("id", invitationId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function resendInvitation(invitationId: string) {
  const admin = await getProfile();
  if (!admin || admin.role !== "ADMIN") return { error: "Unauthorized" };

  const supabase = getMutationClient();

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600000).toISOString();

  const { error } = await supabase
    .from("invitations")
    .update({ token, expires_at: expiresAt })
    .eq("id", invitationId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true, token };
}
