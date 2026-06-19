import { Database } from "@/lib/database/database.types";

export type Milestone =
  Database["public"]["Tables"]["milestones"]["Row"];

export type MilestoneInsert =
  Database["public"]["Tables"]["milestones"]["Insert"];

export type MilestoneUpdate =
  Database["public"]["Tables"]["milestones"]["Update"];