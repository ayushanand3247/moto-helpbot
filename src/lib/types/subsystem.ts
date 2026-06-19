import { Database } from "@/lib/database/database.types";

export type Subsystem =
  Database["public"]["Tables"]["subsystems"]["Row"];

export type SubsystemInsert =
  Database["public"]["Tables"]["subsystems"]["Insert"];

export type SubsystemUpdate =
  Database["public"]["Tables"]["subsystems"]["Update"];