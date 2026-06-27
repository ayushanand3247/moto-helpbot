/**
 * Format a date string or Date object into a human-readable relative time string.
 * Examples: "just now", "5 minutes ago", "2 hours ago", "Yesterday", "3 days ago"
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60)
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Convert an activity action key to a human-readable sentence fragment.
 * e.g. "TASK_CREATED" â†’ "created a task"
 */
export function formatActivityAction(action: string): string {
  const map: Record<string, string> = {
    TASK_CREATED: "created a task",
    STATUS_CHANGED: "changed task status",
    PROGRESS_SUBMITTED: "submitted progress",
    COMMENT_ADDED: "added a comment",
    TASK_APPROVED: "approved a task",
    CHANGES_REQUESTED: "requested changes",
    USER_INVITED: "invited a user",
    USER_REGISTERED: "joined the team",
    ROLE_CHANGED: "changed a user's role",
    SUBSYSTEM_CHANGED: "changed a user's subsystem",
    USER_DEACTIVATED: "deactivated a user",
    USER_REACTIVATED: "reactivated a user",
  };
  return map[action] ?? action.toLowerCase().replace(/_/g, " ");
}

