import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database/database.types";
import type { AdminUser, AdminInvitation } from "./types";

export async function getUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      role,
      position,
      is_active,
      created_at,
      subsystems (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(user => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    position: user.position,
    is_active: user.is_active ?? true,
    subsystem: user.subsystems
      ? (() => {
          const s = Array.isArray(user.subsystems) ? user.subsystems[0] : user.subsystems;
          return s ? { id: s.id, name: s.name } : null;
        })()
      : null,
    created_at: user.created_at
  }));
}

export async function getSubsystems() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subsystems")
    .select("id, name")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getPendingInvitations(): Promise<AdminInvitation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invitations")
    .select(`
      id,
      email,
      full_name,
      role,
      position,
      subsystem_id,
      invited_by,
      token,
      expires_at,
      accepted_at,
      created_at,
      profiles!invitations_invited_by_fkey (
        full_name
      ),
      subsystems!invitations_subsystem_id_fkey (
        id,
        name
      )
    `)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(invitation => ({
    id: invitation.id,
    email: invitation.email,
    full_name: invitation.full_name,
    role: invitation.role,
    position: invitation.position,
    subsystem: invitation.subsystems
      ? (() => {
          const s = Array.isArray(invitation.subsystems) ? invitation.subsystems[0] : invitation.subsystems;
          return s ? { id: s.id, name: s.name } : null;
        })()
      : null,
    invited_by: invitation.profiles?.[0]?.full_name || null,
    token: invitation.token,
    expires_at: invitation.expires_at,
    accepted_at: invitation.accepted_at,
    created_at: invitation.created_at
  }));
}
