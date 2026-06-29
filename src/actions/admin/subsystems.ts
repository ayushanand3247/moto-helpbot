"use server";

import { revalidatePath } from "next/cache";
import { getMutationClient } from "@/lib/supabase/server-mutation";
import { getProfile } from "@/lib/auth/get-profile";

export async function createSubsystem(data: { name: string; icon?: string; color?: string }) {
  const admin = await getProfile();
  if (!admin || admin.role !== "ADMIN") return { error: "Unauthorized" };

  const supabase = getMutationClient();
  const { data: result, error } = await supabase
    .from("subsystems")
    .insert({ name: data.name, icon: data.icon || null, color: data.color || null })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true, data: result };
}

export async function renameSubsystem(subsystemId: string, name: string) {
  const admin = await getProfile();
  if (!admin || admin.role !== "ADMIN") return { error: "Unauthorized" };

  const supabase = getMutationClient();
  const { error } = await supabase.from("subsystems").update({ name }).eq("id", subsystemId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteSubsystem(subsystemId: string) {
  const admin = await getProfile();
  if (!admin || admin.role !== "ADMIN") return { error: "Unauthorized" };

  const supabase = getMutationClient();

  // Check if subsystem has members
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subsystem_id", subsystemId);

  if (count && count > 0) return { error: "Cannot delete subsystem with assigned members" };

  const { error } = await supabase.from("subsystems").delete().eq("id", subsystemId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function updateSubsystem(subsystemId: string, data: { icon?: string; color?: string; name?: string }) {
  const admin = await getProfile();
  if (!admin || admin.role !== "ADMIN") return { error: "Unauthorized" };

  const supabase = getMutationClient();
  const { error } = await supabase.from("subsystems").update(data).eq("id", subsystemId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}
