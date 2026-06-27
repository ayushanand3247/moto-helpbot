import { createClient } from "@/lib/supabase/server";

export async function logActivity(
  actorId: string,
  action: string,
  entityId: string | null,
  entityType: string | null,
  metadata: any = null
) {
  const supabase = await createClient();

  const { error } = await supabase.from("activity_logs").insert({
    actor_id: actorId,
    action,
    entity_id: entityId,
    entity_type: entityType,
    metadata: metadata || null,
  });

  if (error) {
    console.error("Error logging activity in logActivity:", error);
  }
}

