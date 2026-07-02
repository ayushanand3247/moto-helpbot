/**
 * Seed script for MotoManipal.
 *
 * Usage:
 *   1. Set SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   2. npx tsx scripts/seed.ts
 *
 * This script:
 *   - Creates the 7 standard subsystems
 *   - Creates an admin user (admin@motomanipal.com / AdminMoto123!)
 *   - Creates sample members for each subsystem
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log("Seeding MotoManipal...\n");

  // ── 1. Subsystems ────────────────────────────────────────────
  const subsystems = [
    { name: "Structures", icon: "🏗️", color: "#3b82f6" },
    { name: "Transmission", icon: "⚙️", color: "#22c55e" },
    { name: "Vehicle Dynamics", icon: "🛞", color: "#f59e0b" },
    { name: "Aerodynamics", icon: "🌀", color: "#8b5cf6" },
    { name: "EPT (Electrical, Powertrain & Telemetry)", icon: "⚡", color: "#ef4444" },
    { name: "Machine Learning", icon: "🤖", color: "#06b6d4" },
    { name: "Management", icon: "📋", color: "#ec4899" },
  ];

  for (const sub of subsystems) {
    const { data: existing } = await admin
      .from("subsystems")
      .select("id")
      .eq("name", sub.name)
      .maybeSingle();

    if (existing) {
      console.log(`  ✓ Subsystem "${sub.name}" already exists`);
    } else {
      const { error } = await admin.from("subsystems").insert(sub);
      if (error) {
        console.error(`  ✗ Failed to create subsystem "${sub.name}": ${error.message}`);
      } else {
        console.log(`  ✓ Created subsystem "${sub.name}"`);
      }
    }
  }

  // ── 2. Admin user ────────────────────────────────────────────
  const adminEmail = "admin@motomanipal.com";
  const adminPassword = "AdminMoto123!";

  const { data: existingAdmin } = await admin
    .from("profiles")
    .select("id")
    .eq("email", adminEmail)
    .maybeSingle();

  if (existingAdmin) {
    console.log(`  ✓ Admin user "${adminEmail}" already exists`);
  } else {
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });

    if (authError) {
      console.error(`  ✗ Failed to create admin auth user: ${authError.message}`);
    } else {
      const { error: profileError } = await admin.from("profiles").upsert({
        id: authData.user.id,
        email: adminEmail,
        full_name: "Admin",
        role: "ADMIN",
        is_active: true,
      });

      if (profileError) {
        console.error(`  ✗ Failed to create admin profile: ${profileError.message}`);
      } else {
        console.log(`  ✓ Created admin user "${adminEmail}" / "${adminPassword}"`);
      }
    }
  }

  // ── 3. Sample members ────────────────────────────────────────
  const sampleMembers = [
    { name: "Alice Johnson", email: "alice@motomanipal.com", subsystem: "Aerodynamics" },
    { name: "Bob Smith", email: "bob@motomanipal.com", subsystem: "Transmission" },
    { name: "Charlie Brown", email: "charlie@motomanipal.com", subsystem: "Machine Learning" },
    { name: "Diana Ross", email: "diana@motomanipal.com", subsystem: "Vehicle Dynamics" },
    { name: "Eve Wilson", email: "eve@motomanipal.com", subsystem: "Management", role: "MANAGER" },
    { name: "Frank Miller", email: "frank@motomanipal.com", subsystem: "EPT (Electrical, Powertrain & Telemetry)" },
    { name: "Grace Lee", email: "grace@motomanipal.com", subsystem: "Structures" },
  ];

  for (const member of sampleMembers) {
    const { data: existingMember } = await admin
      .from("profiles")
      .select("id")
      .eq("email", member.email)
      .maybeSingle();

    if (existingMember) {
      console.log(`  ✓ Member "${member.email}" already exists`);
      continue;
    }

    const password = `${member.name.replace(/\s/g, "")}Moto1!`;

    const { data: sub } = await admin
      .from("subsystems")
      .select("id")
      .eq("name", member.subsystem)
      .single();

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: member.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: member.name },
    });

    if (authError) {
      console.error(`  ✗ Failed to create ${member.email}: ${authError.message}`);
      continue;
    }

    const { error: profileError } = await admin.from("profiles").upsert({
      id: authData.user.id,
      email: member.email,
      full_name: member.name,
      role: (member as any).role || "MEMBER",
      subsystem_id: sub?.id || null,
      is_active: true,
    });

    if (profileError) {
      console.error(`  ✗ Failed to create profile for ${member.email}: ${profileError.message}`);
    } else {
      console.log(`  ✓ Created member "${member.email}" / "${password}"`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
