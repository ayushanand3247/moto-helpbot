"use client";

import type { ReactNode } from "react";
import { Database } from "@/lib/database/database.types";
import { differenceInDays, isPast } from "date-fns";
import { PriorityBadge, StatusBadge } from "@/components/ui/badges";
import { SubsystemBadge } from "@/components/ui/badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  milestone?: {
    id: string;
    title: string;
    project_id: string;
  } | null;
  assigned_to_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    email: string;
  } | null;
  created_by_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    email: string;
  } | null;
  subsystem?: {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
  } | null;
};

interface MetadataPanelProps {
  task: Task;
}

function formatMetadataDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return `${date.getUTCDate().toString().padStart(2, "0")}/${(date.getUTCMonth() + 1).toString().padStart(2, "0")}/${date.getUTCFullYear()}`;
}

function MetadataField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      {children}
    </div>
  );
}

export function MetadataPanel({ task }: MetadataPanelProps) {
  const getDeadlineColor = (deadline: string | null) => {
    if (!deadline) return "text-zinc-400";
    const daysRemaining = differenceInDays(new Date(deadline), new Date());
    if (isPast(new Date(deadline))) return "text-red-400";
    if (daysRemaining <= 7) return "text-amber-400";
    return "text-zinc-300";
  };

  return (
    <div className="space-y-6">
      <MetadataField label="Status">
        <StatusBadge value={task.status || "TODO"} />
      </MetadataField>

      {task.priority && (
        <MetadataField label="Priority">
          <PriorityBadge value={task.priority} />
        </MetadataField>
      )}

      {task.assigned_to_profile && (
        <MetadataField label="Assigned To">
          <div className="flex items-center gap-3">
            <Avatar className="size-8 shrink-0 border border-zinc-800">
              {task.assigned_to_profile.avatar_url ? (
                <img
                  src={task.assigned_to_profile.avatar_url}
                  alt={task.assigned_to_profile.full_name}
                  className="size-full object-cover"
                />
              ) : (
                <AvatarFallback className="bg-zinc-800 text-xs text-zinc-300">
                  {task.assigned_to_profile.full_name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm text-zinc-200">
                {task.assigned_to_profile.full_name}
              </p>
              <p className="truncate text-xs text-zinc-500">
                {task.assigned_to_profile.email}
              </p>
            </div>
          </div>
        </MetadataField>
      )}

      {task.subsystem && (
        <MetadataField label="Subsystem">
          <SubsystemBadge
            value={task.subsystem.name}
            color={task.subsystem.color}
          />
        </MetadataField>
      )}

      {task.milestone && (
        <MetadataField label="Milestone">
          <p className="text-sm text-zinc-300">{task.milestone.title}</p>
        </MetadataField>
      )}

      {task.deadline && (
        <MetadataField label="Deadline">
          <p className={`text-sm ${getDeadlineColor(task.deadline)}`}>
            {formatMetadataDate(task.deadline)}
            {isPast(new Date(task.deadline)) && " - Overdue"}
          </p>
        </MetadataField>
      )}

      {(task.estimated_hours || task.actual_hours) && (
        <div className="grid grid-cols-2 gap-4">
          {task.estimated_hours && (
            <MetadataField label="Estimated">
              <p className="font-mono text-lg text-zinc-200">
                {task.estimated_hours}h
              </p>
            </MetadataField>
          )}
          {task.actual_hours && (
            <MetadataField label="Actual">
              <p className="font-mono text-lg text-zinc-200">
                {task.actual_hours}h
              </p>
            </MetadataField>
          )}
        </div>
      )}

      {task.created_by_profile && (
        <>
          <Separator className="bg-zinc-800" />
          <MetadataField label="Created By">
            <div className="flex items-center gap-3">
              <Avatar className="size-8 shrink-0 border border-zinc-800">
                {task.created_by_profile.avatar_url ? (
                  <img
                    src={task.created_by_profile.avatar_url}
                    alt={task.created_by_profile.full_name}
                    className="size-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-zinc-800 text-xs text-zinc-300">
                    {task.created_by_profile.full_name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm text-zinc-200">
                  {task.created_by_profile.full_name}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatMetadataDate(task.created_at)}
                </p>
              </div>
            </div>
          </MetadataField>
        </>
      )}
    </div>
  );
}

