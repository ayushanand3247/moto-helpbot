"use server";

import { adminClient } from "@/lib/supabase/admin";

export async function getSubsystems() {
  const { data, error } = await adminClient
    .from("subsystems")
    .select(`
      id,
      name,
      icon,
      color
    `)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
