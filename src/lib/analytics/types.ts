import { Database } from "@/lib/database/database.types";

export type TaskStatus = Database["public"]["Enums"]["task_status"];
// "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "APPROVED" | "BLOCKED"

export interface OverallTaskStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
}

export interface SubsystemProgress {
  id: string;
  name: string;
  color: string | null;
  total: number;
  completed: number;
  percentage: number;
}

export interface MemberWorkload {
  id: string;
  full_name: string;
  assigned: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

export interface OverdueTask {
  id: string;
  title: string;
  deadline: string;
  daysOverdue: number;
  assignee: string | null;
  assigneeId: string | null;
}

