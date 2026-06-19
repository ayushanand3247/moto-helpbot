import { Database } from "@/lib/database/database.types";

export type Project =
  Database["public"]["Tables"]["projects"]["Row"];

export type ProjectInsert =
  Database["public"]["Tables"]["projects"]["Insert"];

export type ProjectUpdate =
  Database["public"]["Tables"]["projects"]["Update"];