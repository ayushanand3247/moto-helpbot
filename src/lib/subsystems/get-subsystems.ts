"use server";

import { createClient } from "@/lib/supabase/server";

export async function getSubsystems() {
  const supabase = await createClient();

  const { data, error } = await supabase
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
