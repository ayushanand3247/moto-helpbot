"use client";

import { TimelineEntry } from "./TimelineEntry";
import { Database } from "@/lib/database/database.types";

type TaskUpdate = Database["public"]["Tables"]["task_updates"]["Row"] & {
  author: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    email: string;
  };
  attachments: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type?: string | null;
    file_size_bytes?: number | null;
  }>;
};

interface TaskTimelineProps {
  updates: TaskUpdate[];
  taskTitle: string;
  createdAt?: string | null;
  createdBy?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    email: string;
  };
}

function formatTimelineDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return `${date.getUTCDate().toString().padStart(2, "0")}/${(date.getUTCMonth() + 1).toString().padStart(2, "0")}/${date.getUTCFullYear()}`;
}

function formatTimelineTime(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return `${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}`;
}

export function TaskTimeline({
  updates,
  taskTitle,
  createdAt,
  createdBy,
}: TaskTimelineProps) {
  return (
    <div className="space-y-0">
      {createdBy && createdAt && (
        <div className="pb-8">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="mt-1.5 size-2 rounded-full bg-zinc-600" />
              <div className="mt-2 w-px flex-1 bg-zinc-800" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-zinc-200">
                <span className="font-medium">{createdBy.full_name}</span> created task
              </p>
              <p className="mt-1 text-sm text-zinc-400">{taskTitle}</p>
              <p className="mt-1.5 font-mono text-xs text-zinc-500">
                {formatTimelineDate(createdAt)} at {formatTimelineTime(createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {updates.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-zinc-500">No activity yet</p>
        </div>
      ) : (
        updates.map((update) => (
          <TimelineEntry
            key={update.id}
            id={update.id}
            updateType={update.update_type}
            content={update.content}
            oldStatus={update.old_status}
            newStatus={update.new_status}
            author={update.author}
            createdAt={update.created_at}
            attachments={update.attachments}
          />
        ))
      )}
    </div>
  );
}
