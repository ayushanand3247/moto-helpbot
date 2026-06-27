import { Database } from "@/lib/database/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];
export type UserStatus = Database["public"]["Tables"]["profiles"]["Row"]["is_active"];

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  position: string | null;
  is_active: boolean;
  subsystem: {
    id: string;
    name: string;
  } | null;
  created_at: string;
}

export interface AdminInvitation {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  position: string | null;
  subsystem: {
    id: string;
    name: string;
  } | null;
  invited_by: string | null;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}
