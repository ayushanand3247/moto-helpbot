"use client";

import { ChangeEvent, useId, useState } from "react";
import { submitUpdate } from "@/actions/tasks";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
}: UpdateFormProps) {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadError, setUploadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const attachmentInputId = useId();

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

    const invalidFiles = files.filter(
      (file) => file.size > MAX_FILE_SIZE_BYTES || !isAllowedFile(file)
    );

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

  const fileInputClassName = "peer sr-only";

  const renderFileList = () =>
    selectedFiles.length > 0 ? (
      <div className="space-y-2">
        {selectedFiles.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-zinc-200">{file.name}</p>
              <p className="text-xs text-zinc-500">{formatFileSize(file.size)}</p>
            </div>

            <div className="flex items-center gap-2">
              {uploadProgress[file.name] !== undefined && (
                <div className="w-20">
                  <div className="h-1 w-full rounded-full bg-zinc-800">
                    <div
                      className="h-1 rounded-full bg-zinc-400 transition-all"
                      style={{ width: `${uploadProgress[file.name]}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => removeSelectedFile(index)}
                className="text-sm text-zinc-500 hover:text-red-400"
                disabled={isLoading}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : null;

  const renderAttachments = () => (
    <div className="space-y-2.5">
      <Label htmlFor={attachmentInputId}>Attachments (optional)</Label>
      <input
        id={attachmentInputId}
        type="file"
        multiple
        accept="image/*,application/pdf,.dwg,.step,.stl"
        onChange={handleFileSelection}
        disabled={isLoading}
        className={fileInputClassName}
        aria-describedby={`${attachmentInputId}-help`}
      />
      <label
        htmlFor={attachmentInputId}
        className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-950 px-4 py-5 text-center transition-colors hover:border-zinc-500 hover:bg-zinc-900/70 peer-focus-visible:border-red-500 peer-focus-visible:ring-3 peer-focus-visible:ring-red-500/20 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        <span className="text-sm font-medium text-zinc-200">
          Choose files to upload
        </span>
        <span id={`${attachmentInputId}-help`} className="mt-1 text-xs text-zinc-500">
          Up to 5 files, 25MB each. Images, PDF, DWG, STEP, STL.
        </span>
        {selectedFiles.length > 0 ? (
          <span className="mt-2 text-xs text-zinc-400">
            {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} selected
          </span>
        ) : null}
      </label>
      {renderFileList()}
    </div>
  );

  return (
    <Card>
      {isMemberAssignedToTask && (
        <CardContent className="space-y-4 pt-5">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Submit Update
            </CardTitle>
          </CardHeader>

          {taskStatus === "TODO" && (
            <Button
              onClick={handleStartWork}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Starting..." : "Start Work"}
            </Button>
          )}

          <Textarea
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
            rows={4}
          />

          {renderAttachments()}

          <div className="flex gap-2">
            <Button
              onClick={handleSubmitProgress}
              disabled={isLoading || !content.trim()}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? "Submitting..." : "Submit Progress"}
            </Button>

            {taskStatus === "IN_PROGRESS" && (
              <Button
                onClick={handleSubmitForReview}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Submitting..." : "Submit for Review"}
              </Button>
            )}
          </div>
        </CardContent>
      )}

      {isBoardOrAdmin && (
        <CardContent className="space-y-4 pt-5">
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {isMemberAssignedToTask ? "Board Actions" : "Add Comment"}
            </CardTitle>
          </CardHeader>

          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError("");
            }}
            placeholder="Add a comment..."
            rows={4}
          />

          {renderAttachments()}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handlePostComment}
              disabled={isLoading || !content.trim()}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? "Posting..." : "Post Comment"}
            </Button>

            {taskStatus === "IN_REVIEW" && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Approving..." : "Approve"}
                </Button>

                <Button
                  onClick={handleRequestChanges}
                  disabled={isLoading || !content.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {isLoading ? "Sending..." : "Request Changes"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      )}

      {uploadError && (
        <div className="mx-5 mb-5 rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
          {uploadError}
        </div>
      )}

      {error && (
        <div className="mx-5 mb-5 rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </Card>
  );
}



