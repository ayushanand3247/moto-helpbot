export const taskStatusBadgeClasses: Record<string, string> = {
  TODO: "border-zinc-700 bg-zinc-950 text-zinc-500",
  IN_PROGRESS: "border-zinc-500/60 bg-zinc-900/70 text-zinc-200",
  IN_REVIEW: "border-zinc-600 bg-zinc-900/70 text-zinc-300",
  APPROVED: "border-zinc-700 bg-zinc-950 text-zinc-400",
  BLOCKED: "border-red-500/30 bg-red-500/5 text-red-400",
};

export const priorityBadgeClasses: Record<string, string> = {
  LOW: "border-zinc-700 bg-zinc-950 text-zinc-500",
  MEDIUM: "border-zinc-600 bg-zinc-900/70 text-zinc-300",
  HIGH: "border-zinc-500/60 bg-zinc-900/70 text-zinc-100",
  CRITICAL: "border-red-500/30 bg-red-500/5 text-red-400",
};

export const projectStatusBadgeClasses: Record<string, string> = {
  PLANNING: "border-zinc-700 bg-zinc-950 text-zinc-500",
  ACTIVE: "border-zinc-500/60 bg-zinc-900/70 text-zinc-200",
  COMPLETED: "border-zinc-700 bg-zinc-950 text-zinc-400",
  ARCHIVED: "border-zinc-800 bg-zinc-950 text-zinc-600",
};

export const milestoneStatusBadgeClasses: Record<string, string> = {
  NOT_STARTED: "border-zinc-700 bg-zinc-950 text-zinc-500",
  IN_PROGRESS: "border-zinc-500/60 bg-zinc-900/70 text-zinc-200",
  COMPLETED: "border-zinc-700 bg-zinc-950 text-zinc-400",
};

export function badgeClassForValue(
  value: string | null | undefined,
  classes: Record<string, string>,
  fallback = "border-zinc-700 bg-zinc-950 text-zinc-400"
) {
  if (!value) {
    return fallback;
  }

  return classes[value] ?? fallback;
}

export function formatBadgeLabel(value: string) {
  return value.replace(/_/g, " ");
}

