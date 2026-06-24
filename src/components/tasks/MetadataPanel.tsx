"use client";

import { Database } from "@/lib/database/database.types";
import { differenceInDays, isPast } from "date-fns";

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

export function MetadataPanel({ task }: MetadataPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "IN_REVIEW":
        return "bg-purple-100 text-purple-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "BLOCKED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDeadlineColor = (deadline: string | null) => {
    if (!deadline) return "text-gray-600";
    const daysRemaining = differenceInDays(new Date(deadline), new Date());
    if (isPast(new Date(deadline))) return "text-red-600";
    if (daysRemaining <= 7) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
        <div
          className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(task.status || "TODO")}`}
        >
          {task.status || "TODO"}
        </div>
      </div>

      {/* Priority */}
      {task.priority && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Priority</p>
          <div
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}
          >
            {task.priority}
          </div>
        </div>
      )}

      {/* Assignee */}
      {task.assigned_to_profile && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Assigned To</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium overflow-hidden">
              {task.assigned_to_profile.avatar_url ? (
                <img
                  src={task.assigned_to_profile.avatar_url}
                  alt={task.assigned_to_profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                task.assigned_to_profile.full_name.charAt(0)
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {task.assigned_to_profile.full_name}
              </p>
              <p className="text-xs text-gray-500">
                {task.assigned_to_profile.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subsystem */}
      {task.subsystem && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Subsystem</p>
          <div className="flex items-center gap-2">
            {task.subsystem.icon && (
              <span className="text-lg">{task.subsystem.icon}</span>
            )}
            <span className="text-sm font-medium text-gray-900">
              {task.subsystem.name}
            </span>
          </div>
        </div>
      )}

      {/* Milestone */}
      {task.milestone && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Milestone</p>
          <p className="text-sm font-medium text-gray-900">
            {task.milestone.title}
          </p>
        </div>
      )}

      {/* Deadline */}
      {task.deadline && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Deadline</p>
          <p className={`text-sm font-medium ${getDeadlineColor(task.deadline)}`}>
            {formatMetadataDate(task.deadline)}
            {isPast(new Date(task.deadline)) && " (Overdue)"}
          </p>
        </div>
      )}

      {/* Hours */}
      <div className="grid grid-cols-2 gap-4">
        {task.estimated_hours && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Estimated
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {task.estimated_hours}h
            </p>
          </div>
        )}
        {task.actual_hours && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Actual</p>
            <p className="text-lg font-semibold text-gray-900">
              {task.actual_hours}h
            </p>
          </div>
        )}
      </div>

      {/* Created By */}
      {task.created_by_profile && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-2">Created By</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium overflow-hidden">
              {task.created_by_profile.avatar_url ? (
                <img
                  src={task.created_by_profile.avatar_url}
                  alt={task.created_by_profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                task.created_by_profile.full_name.charAt(0)
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {task.created_by_profile.full_name}
              </p>
              <p className="text-xs text-gray-500">
                {formatMetadataDate(task.created_at)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
