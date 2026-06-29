"use client";

import { formatDistanceToNow, format } from "date-fns";
import { Database } from "@/lib/database/database.types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Paperclip } from "lucide-react";

type UpdateType = Database["public"]["Enums"]["update_type"];

interface TimelineEntryProps {
  id: string;
  updateType: UpdateType;
  content?: string | null;
  oldStatus?: string | null;
  newStatus?: string | null;
  author: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    email: string;
  };
  createdAt?: string | null;
  attachments?: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type?: string | null;
    file_size_bytes?: number | null;
  }>;
}

export function TimelineEntry({
  updateType,
  content,
  oldStatus,
  newStatus,
  author,
  createdAt,
  attachments,
}: TimelineEntryProps) {
  const timestamp = createdAt ? new Date(createdAt) : new Date();
  const isRecent = createdAt
    ? Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
    : false;
  const timeString = isRecent
    ? formatDistanceToNow(timestamp, { addSuffix: true })
    : format(timestamp, "MMM d 'at' h:mm a");

  const statusVariant: Record<string, "secondary" | "default" | "warning" | "success" | "destructive"> = {
    TODO: "secondary",
    IN_PROGRESS: "default",
    IN_REVIEW: "warning",
    APPROVED: "success",
    BLOCKED: "destructive",
  };

  const dotClass = {
    PROGRESS: "moto-dot-active",
    APPROVAL: "moto-dot-active",
    REJECTION: "moto-dot-danger",
    STATUS_CHANGE: "moto-dot-warning",
    COMMENT: "moto-dot-idle",
  }[updateType] ?? "moto-dot-idle";

  return (
    <div className="flex gap-3 pb-5 relative">
      {/* Timeline rail */}
      <div className="flex flex-col items-center">
        <div className={`moto-dot ${dotClass} mt-2`} />
        <div className="w-px flex-1 mt-1 bg-border/20" />
      </div>

      {/* Content */}
      <div className="flex-1 mt-1">
        {updateType === "STATUS_CHANGE" ? (
          <div className="text-xs text-muted-foreground/80">
            <span className="font-medium text-foreground/80">{author.full_name}</span>{" "}
            changed status{" "}
            <Badge variant={statusVariant[oldStatus || "TODO"] ?? "secondary"} className="text-[0.55rem]">
              {(oldStatus || "TODO").replace("_", " ")}
            </Badge>
            {" → "}
            <Badge variant={statusVariant[newStatus || "TODO"] ?? "secondary"} className="text-[0.55rem]">
              {(newStatus || "TODO").replace("_", " ")}
            </Badge>
            <div className="text-[0.6rem] text-muted-foreground/70 mt-1">{timeString}</div>
          </div>
        ) : updateType === "APPROVAL" ? (
          <div className="rounded-md bg-moto-green/10 border border-moto-green/20 p-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-moto-green" />
              <p className="text-xs font-medium text-moto-green">
                Approved by {author.full_name}
              </p>
            </div>
            <p className="text-[0.6rem] text-moto-green/50 mt-1">{timeString}</p>
          </div>
        ) : updateType === "REJECTION" ? (
          <div className="rounded-md bg-moto-red/10 border border-moto-red/20 p-3">
            <div className="flex items-center gap-1.5">
              <XCircle className="size-3.5 text-moto-red" />
              <p className="text-xs font-medium text-moto-red">
                Changes requested by {author.full_name}
              </p>
            </div>
            {content && (
              <p className="text-xs text-moto-red/70 mt-1.5 whitespace-pre-wrap">
                {content}
              </p>
            )}
            <p className="text-[0.6rem] text-moto-red/40 mt-1.5">{timeString}</p>
          </div>
        ) : (
          <div className="rounded-md border border-border/30 bg-card/30 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="size-5 rounded-full bg-muted/50 border border-border/30 flex items-center justify-center text-[0.45rem] font-medium text-muted-foreground uppercase overflow-hidden">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  author.full_name.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground/80">
                  {author.full_name}
                </p>
                <p className="text-[0.6rem] text-muted-foreground/70">
                  {updateType === "PROGRESS" ? "Progress" : "Comment"} · {timeString}
                </p>
              </div>
            </div>
            {content && (
              <p className="text-xs text-foreground/70 whitespace-pre-wrap mb-2 leading-relaxed">
                {content}
              </p>
            )}

            {/* Attachments */}
            {attachments && attachments.length > 0 && (
              <div className="mt-2 space-y-1.5 border-t border-border/20 pt-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-1.5">
                    {attachment.file_type?.startsWith("image/") ? (
                      <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <img
                          src={attachment.file_url}
                          alt={attachment.file_name}
                          className="max-w-[200px] h-auto rounded border border-border/20"
                        />
                      </a>
                    ) : (
                      <a
                        href={attachment.file_url}
                        download={attachment.file_name}
                        className="flex items-center gap-1.5 text-[0.65rem] text-moto-cyan hover:text-moto-cyan/80 transition-colors"
                      >
                        <Paperclip className="size-3" />
                        <span>{attachment.file_name}</span>
                        {attachment.file_size_bytes && (
                          <span className="moto-number text-muted-foreground/60">
                            ({(attachment.file_size_bytes / 1024).toFixed(1)} KB)
                          </span>
                        )}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
