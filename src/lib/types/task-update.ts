import { Database } from "@/lib/database/database.types";

export type TaskUpdateRecord =
  Database["public"]["Tables"]["task_updates"]["Row"];

export type TaskUpdateInsert =
  Database["public"]["Tables"]["task_updates"]["Insert"];

export type TaskUpdateUpdate =
  Database["public"]["Tables"]["task_updates"]["Update"];