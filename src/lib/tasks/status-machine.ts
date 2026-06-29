import { Database } from "@/lib/database/database.types";

type TaskStatus = Database["public"]["Enums"]["task_status"];
type UserRole = Database["public"]["Enums"]["user_role"];

interface TransitionRule {
  from: TaskStatus;
  to: TaskStatus;
  allowedRoles: UserRole[];
  requiresComment?: boolean;
}

const transitions: TransitionRule[] = [
  {
    from: "TODO",
    to: "IN_PROGRESS",
    allowedRoles: ["MEMBER", "SUBSYSTEM_LEAD", "CAPTAIN", "TEAM_MANAGER", "ADMIN"],
  },
  {
    from: "IN_PROGRESS",
    to: "IN_REVIEW",
    allowedRoles: ["MEMBER", "SUBSYSTEM_LEAD", "CAPTAIN", "TEAM_MANAGER", "ADMIN"],
  },
  {
    from: "IN_REVIEW",
    to: "APPROVED",
    allowedRoles: ["SUBSYSTEM_LEAD", "CAPTAIN", "TEAM_MANAGER", "ADMIN"],
  },
  {
    from: "IN_REVIEW",
    to: "IN_PROGRESS",
    allowedRoles: ["SUBSYSTEM_LEAD", "CAPTAIN", "TEAM_MANAGER", "ADMIN"],
    requiresComment: true,
  },
  {
    from: "TODO",
    to: "BLOCKED",
    allowedRoles: ["SUBSYSTEM_LEAD", "CAPTAIN", "TEAM_MANAGER", "ADMIN"],
    requiresComment: true,
  },
  {
    from: "IN_PROGRESS",
    to: "BLOCKED",
    allowedRoles: ["SUBSYSTEM_LEAD", "CAPTAIN", "TEAM_MANAGER", "ADMIN"],
    requiresComment: true,
  },
  {
    from: "IN_REVIEW",
    to: "BLOCKED",
    allowedRoles: ["SUBSYSTEM_LEAD", "CAPTAIN", "TEAM_MANAGER", "ADMIN"],
    requiresComment: true,
  },
  {
    from: "BLOCKED",
    to: "IN_PROGRESS",
    allowedRoles: ["SUBSYSTEM_LEAD", "CAPTAIN", "TEAM_MANAGER", "ADMIN"],
  },
];

export function canTransition(
  currentStatus: TaskStatus,
  nextStatus: TaskStatus,
  role: UserRole
): boolean {
  return transitions.some(
    (rule) =>
      rule.from === currentStatus &&
      rule.to === nextStatus &&
      rule.allowedRoles.includes(role)
  );
}

export function requiresComment(
  currentStatus: TaskStatus,
  nextStatus: TaskStatus
): boolean {
  const rule = transitions.find(
    (r) => r.from === currentStatus && r.to === nextStatus
  );
  return rule?.requiresComment ?? false;
}
