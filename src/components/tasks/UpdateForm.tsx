"use client";

import { ChangeEvent, useState } from "react";
import { submitUpdate } from "@/actions/tasks";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database/database.types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X, Paperclip, CheckCircle2, RotateCcw } from "lucide-react";

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
  assigneeIds?: string[];
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
  assigneeIds = [],
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

  const isPrimaryAssignee = assignedTo === userId;
  const isJunctionAssignee = assigneeIds.includes(userId);
  const isMemberAssignedToTask = (isPrimaryAssignee || isJunctionAssignee) && userRole === "MEMBER";
  const isBoardOrAdmin = userRole === "ADMIN" || userRole === "TEAM_MANAGER" || userRole === "CAPTAIN" || userRole === "SUBSYSTEM_LEAD";

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

  const fileInputClass = "block w-full text-xs text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-[0.65rem] file:font-semibold file:tracking-wider file:uppercase file:bg-moto-cyan/10 file:text-moto-cyan hover:file:bg-moto-cyan/20 file:cursor-pointer file:transition-colors";

  const renderFileList = () => (
    selectedFiles.length > 0 && (
      <div className="space-y-1.5">
        {selectedFiles.map((file, index) => (
          <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border border-border/30 bg-muted/20 px-3 py-1.5">
            <div className="min-w-0 flex items-center gap-2">
              <Paperclip className="size-3 text-muted-foreground/70" />
              <div>
                <p className="truncate text-xs font-medium text-foreground/80">{file.name}</p>
                <p className="text-[0.6rem] moto-number text-muted-foreground/70">{formatFileSize(file.size)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {uploadProgress[file.name] !== undefined && (
                <div className="w-16">
                  <div className="h-1 w-full rounded-full bg-muted">
                    <div
                      className="h-1 rounded-full bg-moto-cyan transition-all"
                      style={{ width: `${uploadProgress[file.name]}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => removeSelectedFile(index)}
                className="size-4 rounded-sm flex items-center justify-center text-muted-foreground/70 hover:text-moto-red hover:bg-moto-red/10 transition-colors"
                disabled={isLoading}
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="rounded-lg border border-border/40 bg-card/50 p-4 space-y-4">
      {isMemberAssignedToTask && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            Submit Update
          </h3>

          {taskStatus === "TODO" && (
            <Button
              onClick={handleStartWork}
              disabled={isLoading}
              className="w-full"
              size="sm"
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
            rows={3}
            className="resize-none text-sm"
          />

          <div className="space-y-2">
            <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">
              Attachments (optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.dwg,.step,.stl"
              onChange={handleFileSelection}
              disabled={isLoading}
              className={fileInputClass}
            />
            <p className="text-[0.6rem] text-muted-foreground/70">
              Up to 5 files, 25MB each. Supported: images, PDF, DWG, STEP, STL.
            </p>
            {renderFileList()}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmitProgress}
              disabled={isLoading || !content.trim()}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {isLoading ? "Submitting..." : "Submit Progress"}
            </Button>

            {taskStatus === "IN_PROGRESS" && (
              <Button
                onClick={handleSubmitForReview}
                disabled={isLoading}
                size="sm"
                className="flex-1"
              >
                {isLoading ? "Submitting..." : "Submit for Review"}
              </Button>
            )}
          </div>
        </div>
      )}

      {isBoardOrAdmin && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            {isMemberAssignedToTask ? "Lead Actions" : "Add Comment"}
          </h3>

          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError("");
            }}
            placeholder="Add a comment..."
            rows={3}
            className="resize-none text-sm"
          />

          <div className="space-y-2">
            <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">
              Attachments (optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.dwg,.step,.stl"
              onChange={handleFileSelection}
              disabled={isLoading}
              className={fileInputClass}
            />
            <p className="text-[0.6rem] text-muted-foreground/70">
              Up to 5 files, 25MB each. Supported: images, PDF, DWG, STEP, STL.
            </p>
            {renderFileList()}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handlePostComment}
              disabled={isLoading || !content.trim()}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {isLoading ? "Posting..." : "Post Comment"}
            </Button>

            {taskStatus === "IN_REVIEW" && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <CheckCircle2 className="size-3.5" />
                  {isLoading ? "Approving..." : "Approve"}
                </Button>

                <Button
                  onClick={handleRequestChanges}
                  disabled={isLoading || !content.trim()}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  <RotateCcw className="size-3.5" />
                  {isLoading ? "Sending..." : "Request Changes"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {uploadError && (
        <div className="rounded-md bg-moto-red/10 border border-moto-red/20 p-2.5 text-xs text-moto-red">
          {uploadError}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-moto-red/10 border border-moto-red/20 p-2.5 text-xs text-moto-red">
          {error}
        </div>
      )}
    </div>
  );
}
