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
      {/* Task creation entry */}
      {createdBy && createdAt && (
        <div className="pb-6">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="moto-dot moto-dot-active mt-2" />
              <div className="w-px h-12 mt-1 bg-border/30" />
            </div>
            <div className="flex-1 mt-1">
              <p className="text-xs font-medium text-foreground/90">
                {createdBy.full_name} <span className="text-muted-foreground/70">created task</span>
              </p>
              <p className="text-xs text-foreground/70 mt-0.5">{taskTitle}</p>
              <p className="text-[0.6rem] moto-number text-muted-foreground/70 mt-1.5">
                {formatTimelineDate(createdAt)} {formatTimelineTime(createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Updates timeline */}
      {updates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-muted-foreground/70">No activity yet</p>
        </div>
      ) : (
        updates.map((update, index) => (
          <div key={update.id}>
            <TimelineEntry
              id={update.id}
              updateType={update.update_type}
              content={update.content}
              oldStatus={update.old_status}
              newStatus={update.new_status}
              author={update.author}
              createdAt={update.created_at}
              attachments={update.attachments}
            />
            {index === updates.length - 1 && (
              <div className="flex gap-3 pt-3">
                <div className="flex flex-col items-center">
                  <div className="moto-dot moto-dot-idle mt-2" />
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
