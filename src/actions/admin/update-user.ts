"use server";

import { revalidatePath } from "next/cache";
import { getMutationClient } from "@/lib/supabase/server-mutation";
import { getProfile } from "@/lib/auth/get-profile";

const ALLOWED_ROLES = ["ADMIN", "TEAM_MANAGER", "CAPTAIN", "SUBSYSTEM_LEAD", "MEMBER"] as const;
type EditableRole = (typeof ALLOWED_ROLES)[number];

const EDITOR_ROLES: EditableRole[] = ["ADMIN", "TEAM_MANAGER", "CAPTAIN"];

type UpdateUserParams = {
  userId: string;
  role?: EditableRole;
  subsystem_id?: string | null;
  position?: string | null;
  is_active?: boolean;
};

export async function updateUser(params: UpdateUserParams) {
  const { userId, role, subsystem_id, position, is_active } = params;

  const editor = await getProfile();
  if (!editor || !EDITOR_ROLES.includes(editor.role as EditableRole)) {
    return { error: "Unauthorized — only Captain, Team Manager, or Admin can edit users" };
  }

  if (userId === editor.id && role && role !== editor.role) {
    return { error: "Cannot change your own role" };
  }

  // Build update object from only provided fields
  const update: Record<string, unknown> = {};
  if (role !== undefined) {
    if (!ALLOWED_ROLES.includes(role)) {
      return { error: `Invalid role: ${role}` };
    }
    update.role = role;
  }
  if (subsystem_id !== undefined) {
    // Validate subsystem exists if provided (non-null, non-empty)
    if (subsystem_id) {
      const supabase = getMutationClient();
      const { data: sub } = await supabase
        .from("subsystems")
        .select("id")
        .eq("id", subsystem_id)
        .single();
      if (!sub) {
        return { error: `Invalid subsystem: ${subsystem_id}` };
      }
    }
    update.subsystem_id = subsystem_id || null;
  }
  if (position !== undefined) {
    update.position = position || null;
  }
  if (is_active !== undefined) {
    update.is_active = is_active;
  }

  if (Object.keys(update).length === 0) {
    return { error: "No fields to update" };
  }

  const supabase = getMutationClient();
  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", userId);

  if (error) return { error: error.message };

  // Log activity
  await supabase.from("activity_logs").insert({
    action: "USER_UPDATED",
    actor_id: editor.id,
    entity_type: "USER",
    entity_id: userId,
    metadata: update,
  });

  // Revalidate all views that display user data
  revalidatePath("/admin");
  revalidatePath("/team");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/tasks");

  return { success: true };
}
