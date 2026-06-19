import { Database } from "@/lib/database/database.types";

export type Invitation =
  Database["public"]["Tables"]["invitations"]["Row"];

export type InvitationInsert =
  Database["public"]["Tables"]["invitations"]["Insert"];

export type InvitationUpdate =
  Database["public"]["Tables"]["invitations"]["Update"];