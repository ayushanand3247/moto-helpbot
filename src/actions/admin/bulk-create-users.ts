"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/auth/get-profile";

/**
 * Bulk-create users from a list of { name, email, subsystem }.
 * Password format: "NameMoto" (spaces stripped, first letter capitalized).
 * If duplicates: NameMoto1, NameMoto2, etc.
 */

function generatePasswordBase(fullName: string): string {
  // Capitalize first letter of each word, strip spaces
  const namePart = fullName
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  return `${namePart}Moto`;
}

export type BulkUserInput = {
  full_name: string;
  email: string;
  subsystem_name: string;
};

export type BulkUserResult = {
  full_name: string;
  email: string;
  subsystem_name: string;
  password: string;
  status: "success" | "error";
  error?: string;
};

export async function bulkCreateUsers(
  users: BulkUserInput[]
): Promise<{ results: BulkUserResult[] }> {
  const admin = await getProfile();
  if (!admin || admin.role !== "ADMIN") {
    return {
      results: users.map((u) => ({
        ...u,
        password: "",
        status: "error" as const,
        error: "Unauthorized",
      })),
    };
  }

  // 1. Get all subsystems for name → id lookup
  const { data: subsystems } = await adminClient
    .from("subsystems")
    .select("id, name");

  const subMap = new Map<string, string>();
  (subsystems || []).forEach((s: { id: string; name: string }) => subMap.set(s.name.toLowerCase(), s.id));

  // 2. Get all existing profiles to detect duplicate names for password suffix
  const { data: existingProfiles } = await adminClient
    .from("profiles")
    .select("full_name");

  const existingNames = new Map<string, number>(); // base → count
  (existingProfiles || []).forEach((p: { full_name: string }) => {
    const base = generatePasswordBase(p.full_name);
    existingNames.set(base, (existingNames.get(base) || 0) + 1);
  });

  // Also track names from current batch to handle duplicates within the batch
  const batchNameCount = new Map<string, number>();

  const results: BulkUserResult[] = [];

  for (const user of users) {
    const base = generatePasswordBase(user.full_name);

    // Determine suffix: how many with this base already exist (DB + batch so far)
    const dbCount = existingNames.get(base) || 0;
    const batchCount = batchNameCount.get(base) || 0;
    const totalCount = dbCount + batchCount;

    const password = totalCount === 0 ? base : `${base}${totalCount}`;

    // Track for within-batch dedup
    batchNameCount.set(base, batchCount + 1);

    // Resolve subsystem
    const subsystemId = subMap.get(user.subsystem_name.toLowerCase().trim()) || null;

    // 3. Create auth user via service role
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: user.email.trim().toLowerCase(),
      password,
      email_confirm: true, // auto-confirm so they can log in immediately
      user_metadata: {
        full_name: user.full_name.trim(),
      },
    });

    if (authError) {
      results.push({
        ...user,
        password,
        status: "error",
        error: authError.message,
      });
      continue;
    }

    // 4. Create profile row
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: authData.user.id,
      email: user.email.trim().toLowerCase(),
      full_name: user.full_name.trim(),
      role: "MEMBER",
      subsystem_id: subsystemId,
      is_active: true,
    });

    if (profileError) {
      results.push({
        ...user,
        password,
        status: "error",
        error: `Auth created but profile failed: ${profileError.message}`,
      });
      continue;
    }

    // 5. Log activity
    await adminClient.from("activity_logs").insert({
      action: "USER_BULK_CREATED",
      actor_id: admin.id,
      entity_type: "USER",
      entity_id: authData.user.id,
      metadata: {
        email: user.email,
        full_name: user.full_name,
        subsystem: user.subsystem_name,
      },
    });

    results.push({
      ...user,
      password,
      status: "success",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/team");
  revalidatePath("/dashboard");
  return { results };
}
