import * as React from "react";

import { Badge } from "@/components/ui/badge";
import {
  badgeClassForValue,
  formatBadgeLabel,
  milestoneStatusBadgeClasses,
  priorityBadgeClasses,
  projectStatusBadgeClasses,
  taskStatusBadgeClasses,
} from "@/lib/ui/badges";
import { cn } from "@/lib/utils";

type BadgeProps = {
  value?: string | null;
  className?: string;
};

export function StatusBadge({ value, className }: BadgeProps) {
  if (!value) return null;

  const valueKey = value.toUpperCase();
  const classNames = badgeClassForValue(valueKey, {
    ...taskStatusBadgeClasses,
    ...projectStatusBadgeClasses,
    ...milestoneStatusBadgeClasses,
  });

  return (
    <Badge variant="outline" className={cn(classNames, className)}>
      {formatBadgeLabel(valueKey)}
    </Badge>
  );
}

export function PriorityBadge({ value, className }: BadgeProps) {
  if (!value) return null;

  const valueKey = value.toUpperCase();

  return (
    <Badge
      variant="outline"
      className={cn(
        badgeClassForValue(valueKey, priorityBadgeClasses),
        className,
      )}
    >
      {formatBadgeLabel(valueKey)}
    </Badge>
  );
}

export function SubsystemBadge({
  value,
  color,
  className,
}: BadgeProps & { color?: string | null }) {
  if (!value) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        // Subsystem: minimal — a colored dot does all the work
        "inline-flex items-center gap-1 border-[#28282e] bg-transparent font-mono text-[9px] text-[#52525f] uppercase tracking-[0.08em]",
        className,
      )}
    >
      {color ? (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : null}
      {value}
    </Badge>
  );
}
