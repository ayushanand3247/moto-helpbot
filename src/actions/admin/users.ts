"use server";

import { revalidatePath } from "next/cache";
import { getMutationClient } from "@/lib/supabase/server-mutation";
import { getProfile } from "@/lib/auth/get-profile";
import { canEditUserDetails } from "@/lib/roles";

export async function updateUserRole(userId: string, role: string) {
  const admin = await getProfile();
  if (!admin || !canEditUserDetails(admin.role)) return { error: "Unauthorized" };
  if (role !== "ADMIN" && role !== "BOARD" && role !== "MANAGER" && role !== "MEMBER") return { error: "Invalid role" };
  if (userId === admin.id) return { error: "Cannot change your own role" };

  const supabase = getMutationClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    action: "ROLE_CHANGED",
    actor_id: admin.id,
    entity_type: "USER",
    entity_id: userId,
    metadata: { new_role: role },
  });

  revalidatePath("/admin");
  revalidatePath("/team");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateUserSubsystem(userId: string, subsystemId: string | null) {
  const admin = await getProfile();
  if (!admin || !canEditUserDetails(admin.role)) return { error: "Unauthorized" };

  // Validate subsystem if provided
  if (subsystemId) {
    const supabase = getMutationClient();
    const { data: sub } = await supabase.from("subsystems").select("id").eq("id", subsystemId).single();
    if (!sub) return { error: "Invalid subsystem" };
  }

  const supabase = getMutationClient();
  const { error } = await supabase.from("profiles").update({ subsystem_id: subsystemId || null }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/team");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateUserPosition(userId: string, position: string | null) {
  const admin = await getProfile();
  if (!admin || !canEditUserDetails(admin.role)) return { error: "Unauthorized" };

  const supabase = getMutationClient();
  const { error } = await supabase.from("profiles").update({ position: position || null }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/team");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const admin = await getProfile();
  if (!admin || !canEditUserDetails(admin.role)) return { error: "Unauthorized" };

  const supabase = getMutationClient();
  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", userId);
  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    action: isActive ? "USER_REACTIVATED" : "USER_DISABLED",
    actor_id: admin.id,
    entity_type: "USER",
    entity_id: userId,
  });

  revalidatePath("/admin");
  revalidatePath("/team");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  return { success: true };
}

export async function removeUser(userId: string) {
  const admin = await getProfile();
  if (!admin || !canEditUserDetails(admin.role)) return { error: "Unauthorized" };
  if (userId === admin.id) return { error: "Cannot remove yourself" };

  const supabase = getMutationClient();

  await supabase.from("activity_logs").insert({
    action: "USER_REMOVED",
    actor_id: admin.id,
    entity_type: "USER",
    entity_id: userId,
  });

  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/team");
  revalidatePath("/dashboard");
  return { success: true };
}
