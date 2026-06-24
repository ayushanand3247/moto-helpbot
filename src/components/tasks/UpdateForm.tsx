"use client";

import { ChangeEvent, useState } from "react";
import { submitUpdate } from "@/actions/tasks";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database/database.types";

type TaskStatus = Database["public"]["Enums"]["task_status"];
type UserRole = Database["public"]["Enums"]["user_role"];

type AttachmentMetadata = {
  file_name: string;
  file_url: string;
  file_type?: string | null;
  file_size_bytes?: number | null;
};

interface UpdateFormProps {
  taskId: string;
  taskStatus: TaskStatus;
  assignedTo?: string | null;
  userRole: UserRole;
  userId: string;
  createdBy?: string | null;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAllowedFile(file: File) {
  const name = file.name.toLowerCase();
  const extension = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
  const isCad = [".dwg", ".step", ".stl"].includes(extension);

  return isImage || isPdf || isCad;
}

export function UpdateForm({
  taskId,
  taskStatus,
  assignedTo,
  userRole,
  userId,
  createdBy,
}: UpdateFormProps) {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadError, setUploadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isMemberAssignedToTask = assignedTo === userId && userRole === "MEMBER";
  const isBoardOrAdmin = userRole === "BOARD" || userRole === "ADMIN";

  if (!isMemberAssignedToTask && !isBoardOrAdmin) {
    return null;
  }

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    if (selectedFiles.length + files.length > MAX_FILES) {
      setUploadError(`You can upload up to ${MAX_FILES} files.`);
      event.target.value = "";
      return;
    }

    const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE_BYTES || !isAllowedFile(file));

    if (invalidFiles.length > 0) {
      setUploadError("Each file must be 25MB or smaller and use a supported type.");
      event.target.value = "";
      return;
    }

    setSelectedFiles((current) => [...current, ...files]);
    setUploadError("");
    event.target.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setUploadProgress((current) => {
      const next = { ...current };
      delete next[selectedFiles[index]?.name || ""];
      return next;
    });
  };

  const uploadSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      return [] as AttachmentMetadata[];
    }

    const supabase = createClient();
    const uploadedAttachments: AttachmentMetadata[] = [];

    for (const file of selectedFiles) {
      setUploadProgress((current) => ({ ...current, [file.name]: 0 }));

      const safeName = file.name.replace(/\s+/g, "_");
      const filePath = `${userId}/${taskId}/${Date.now()}_${safeName}`;

      setUploadProgress((current) => ({ ...current, [file.name]: 50 }));

      const { data, error } = await supabase.storage.from("attachments").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

      if (error || !data?.path) {
        throw new Error(`Upload failed for ${file.name}: ${error?.message || "Unknown error"}`);
      }

      const { data: publicUrlData } = supabase.storage.from("attachments").getPublicUrl(data.path);

      uploadedAttachments.push({
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        file_type: file.type || null,
        file_size_bytes: file.size,
      });

      setUploadProgress((current) => ({ ...current, [file.name]: 100 }));
    }

    return uploadedAttachments;
  };

  const submitWithAttachments = async (input: {
    content?: string | null;
    updateType: "PROGRESS" | "COMMENT" | "STATUS_CHANGE" | "APPROVAL" | "REJECTION";
    newStatus?: TaskStatus;
  }) => {
    setIsLoading(true);
    setError("");
    setUploadError("");

    try {
      const attachments = await uploadSelectedFiles();

      await submitUpdate({
        taskId,
        content: input.content ?? null,
        updateType: input.updateType,
        newStatus: input.newStatus,
        attachments,
      });

      setContent("");
      setSelectedFiles([]);
      setUploadProgress({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit update");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitProgress = async () => {
    if (!content.trim()) {
      setError("Please enter a progress update");
      return;
    }

    await submitWithAttachments({
      content: content.trim(),
      updateType: "PROGRESS",
    });
  };

  const handleStartWork = async () => {
    await submitWithAttachments({
      updateType: "STATUS_CHANGE",
      newStatus: "IN_PROGRESS",
    });
  };

  const handleSubmitForReview = async () => {
    await submitWithAttachments({
      content: content.trim() || null,
      updateType: "STATUS_CHANGE",
      newStatus: "IN_REVIEW",
    });
  };

  const handlePostComment = async () => {
    if (!content.trim()) {
      setError("Please enter a comment");
      return;
    }

    await submitWithAttachments({
      content: content.trim(),
      updateType: "COMMENT",
    });
  };

  const handleApprove = async () => {
    await submitWithAttachments({
      updateType: "APPROVAL",
      newStatus: "APPROVED",
    });
  };

  const handleRequestChanges = async () => {
    if (!content.trim()) {
      setError("Please provide feedback for requested changes");
      return;
    }

    await submitWithAttachments({
      content: content.trim(),
      updateType: "REJECTION",
      newStatus: "IN_PROGRESS",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {isMemberAssignedToTask && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Submit Update</h3>

          {taskStatus === "TODO" && (
            <button
              onClick={handleStartWork}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Starting..." : "Start Work"}
            </button>
          )}

          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError("");
            }}
            placeholder={
              taskStatus === "TODO"
                ? "Share your progress update..."
                : taskStatus === "IN_PROGRESS"
                ? "Share your progress or submit for review..."
                : "Add a comment..."
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows={4}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Attachments (optional)</label>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.dwg,.step,.stl"
              onChange={handleFileSelection}
              disabled={isLoading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500">Up to 5 files, 25MB each. Supported: images, PDF, DWG, STEP, STL.</p>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {uploadProgress[file.name] !== undefined && (
                        <div className="w-24">
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${uploadProgress[file.name]}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="text-sm text-gray-500 hover:text-red-600"
                        disabled={isLoading}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmitProgress}
              disabled={isLoading || !content.trim()}
              className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Progress"}
            </button>

            {taskStatus === "IN_PROGRESS" && (
              <button
                onClick={handleSubmitForReview}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Submit for Review"}
              </button>
            )}
          </div>
        </div>
      )}

      {isBoardOrAdmin && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            {isMemberAssignedToTask ? "Board Actions" : "Add Comment"}
          </h3>

          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError("");
            }}
            placeholder="Add a comment..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows={4}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Attachments (optional)</label>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.dwg,.step,.stl"
              onChange={handleFileSelection}
              disabled={isLoading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500">Up to 5 files, 25MB each. Supported: images, PDF, DWG, STEP, STL.</p>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {uploadProgress[file.name] !== undefined && (
                        <div className="w-24">
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${uploadProgress[file.name]}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="text-sm text-gray-500 hover:text-red-600"
                        disabled={isLoading}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePostComment}
              disabled={isLoading || !content.trim()}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              {isLoading ? "Posting..." : "Post Comment"}
            </button>

            {taskStatus === "IN_REVIEW" && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? "Approving..." : "Approve"}
                </button>

                <button
                  onClick={handleRequestChanges}
                  disabled={isLoading || !content.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Request Changes"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {uploadError && (
        <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-600">{uploadError}</div>
      )}

      {error && (
        <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}
