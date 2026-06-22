"use client";

import { formatDistanceToNow, format } from "date-fns";
import { Database } from "@/lib/database/database.types";

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

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      TODO: "bg-gray-100 text-gray-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      IN_REVIEW: "bg-purple-100 text-purple-800",
      APPROVED: "bg-green-100 text-green-800",
      BLOCKED: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex gap-4 pb-8 relative">
      {/* Left border */}
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full mt-2 ${
            updateType === "PROGRESS"
              ? "bg-blue-500"
              : updateType === "APPROVAL"
              ? "bg-green-500"
              : updateType === "REJECTION"
              ? "bg-red-500"
              : "bg-gray-400"
          }`}
        />
        <div
          className={`w-0.5 flex-1 mt-2 ${
            updateType === "PROGRESS"
              ? "bg-blue-200"
              : updateType === "APPROVAL"
              ? "bg-green-200"
              : updateType === "REJECTION"
              ? "bg-red-200"
              : "bg-gray-200"
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 mt-1">
        {updateType === "STATUS_CHANGE" ? (
          // Compact status change
          <div className="text-sm text-gray-600">
            <span className="font-medium">{author.full_name}</span> changed
            status from{" "}
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadge(oldStatus || "TODO")}`}>
              {oldStatus}
            </span>{" "}
            to{" "}
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadge(newStatus || "TODO")}`}>
              {newStatus}
            </span>
            <div className="text-xs text-gray-500 mt-1">{timeString}</div>
          </div>
        ) : updateType === "APPROVAL" ? (
          // Approval banner
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800">
              ✓ Task approved by {author.full_name}
            </p>
            <p className="text-xs text-green-700 mt-1">{timeString}</p>
          </div>
        ) : updateType === "REJECTION" ? (
          // Rejection banner
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800">
              Changes requested by {author.full_name}
            </p>
            {content && (
              <p className="text-sm text-red-700 mt-2 whitespace-pre-wrap">
                {content}
              </p>
            )}
            <p className="text-xs text-red-600 mt-2">{timeString}</p>
          </div>
        ) : (
          // Progress or Comment card
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium overflow-hidden">
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
                <p className="text-sm font-medium text-gray-900">
                  {author.full_name}
                </p>
                <p className="text-xs text-gray-500">
                  {updateType === "PROGRESS"
                    ? "Progress Update"
                    : "Comment"}{" "}
                  • {timeString}
                </p>
              </div>
            </div>
            {content && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                {content}
              </p>
            )}

            {/* Attachments */}
            {attachments && attachments.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2">
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
                          className="max-w-xs h-auto rounded border border-gray-200"
                        />
                      </a>
                    ) : (
                      <a
                        href={attachment.file_url}
                        download={attachment.file_name}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <span>📎</span>
                        <span>{attachment.file_name}</span>
                        {attachment.file_size_bytes && (
                          <span className="text-xs text-gray-500">
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
