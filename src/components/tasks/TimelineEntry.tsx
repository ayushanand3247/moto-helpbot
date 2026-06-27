import { formatDistanceToNow, format } from "date-fns";
import { Database } from "@/lib/database/database.types";
import { StatusBadge } from "@/components/ui/badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
    ? new Date().getTime() - timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
    : false;
  const timeString = isRecent
    ? formatDistanceToNow(timestamp, { addSuffix: true })
    : format(timestamp, "MMM d 'at' h:mm a");

  const isComment = updateType === "COMMENT";
  const isProgress = updateType === "PROGRESS";

  return (
    <div className="relative flex gap-4 pb-8">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "mt-1.5 size-2 rounded-full",
            updateType === "APPROVAL"
              ? "bg-emerald-500/60"
              : updateType === "REJECTION"
                ? "bg-red-500/60"
                : isProgress
                  ? "bg-red-600"
                  : "bg-zinc-600"
          )}
        />
        <div className="mt-2 w-px flex-1 bg-zinc-800" />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        {updateType === "STATUS_CHANGE" ? (
          <div className="text-sm text-zinc-400">
            <span className="font-medium text-zinc-200">{author.full_name}</span>{" "}
            changed status from{" "}
            <StatusBadge value={oldStatus || "TODO"} /> to{" "}
            <StatusBadge value={newStatus || "TODO"} />
            <p className="mt-1.5 text-xs text-zinc-500">{timeString}</p>
          </div>
        ) : updateType === "APPROVAL" ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <p className="text-sm text-zinc-200">
              Approved by{" "}
              <span className="font-medium">{author.full_name}</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">{timeString}</p>
          </div>
        ) : updateType === "REJECTION" ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <p className="text-sm text-zinc-200">
              Changes requested by{" "}
              <span className="font-medium">{author.full_name}</span>
            </p>
            {content ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-400">
                {content}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-zinc-500">{timeString}</p>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-lg border px-4 py-3",
              isComment
                ? "border-zinc-800/60 bg-transparent"
                : "border-zinc-800 bg-zinc-900/50"
            )}
          >
            <div className="mb-3 flex items-center gap-3">
              <Avatar className="size-7 border border-zinc-800">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.full_name}
                    className="size-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-zinc-800 text-[10px] text-zinc-300">
                    {author.full_name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-200">
                  {author.full_name}
                </p>
                <p className="text-xs text-zinc-500">
                  {isProgress ? "Progress update" : "Comment"} - {timeString}
                </p>
              </div>
            </div>
            {content ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {content}
              </p>
            ) : null}

            {attachments && attachments.length > 0 ? (
              <div className="mt-3 space-y-2 border-t border-zinc-800 pt-3">
                {attachments.map((attachment) => (
                  <div key={attachment.id}>
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
                          className="max-w-full rounded-md border border-zinc-800 sm:max-w-xs"
                        />
                      </a>
                    ) : (
                      <a
                        href={attachment.file_url}
                        download={attachment.file_name}
                        className="flex min-w-0 items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
                      >
                        <span className="truncate">{attachment.file_name}</span>
                        {attachment.file_size_bytes ? (
                          <span className="text-xs text-zinc-500">
                            ({(attachment.file_size_bytes / 1024).toFixed(1)} KB)
                          </span>
                        ) : null}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}


