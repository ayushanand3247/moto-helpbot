"use client";

import { useState } from "react";
import { submitUpdate } from "@/actions/tasks";
import { Database } from "@/lib/database/database.types";

type TaskStatus = Database["public"]["Enums"]["task_status"];
type UserRole = Database["public"]["Enums"]["user_role"];

interface UpdateFormProps {
  taskId: string;
  taskStatus: TaskStatus;
  assignedTo?: string | null;
  userRole: UserRole;
  userId: string;
  createdBy?: string | null;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isMemberAssignedToTask = assignedTo === userId && userRole === "MEMBER";
  const isBoardOrAdmin = userRole === "BOARD" || userRole === "ADMIN";

  // Show form only if assigned member or board/admin
  if (!isMemberAssignedToTask && !isBoardOrAdmin) {
    return null;
  }

  const handleSubmitProgress = async () => {
    if (!content.trim()) {
      setError("Please enter a progress update");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await submitUpdate({
        taskId,
        content: content.trim(),
        updateType: "PROGRESS",
      });
      setContent("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit update"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWork = async () => {
    setIsLoading(true);
    setError("");

    try {
      await submitUpdate({
        taskId,
        updateType: "STATUS_CHANGE",
        newStatus: "IN_PROGRESS",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start work"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    setIsLoading(true);
    setError("");

    try {
      await submitUpdate({
        taskId,
        content: content.trim() || null,
        updateType: "STATUS_CHANGE",
        newStatus: "IN_REVIEW",
      });
      setContent("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit for review"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!content.trim()) {
      setError("Please enter a comment");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await submitUpdate({
        taskId,
        content: content.trim(),
        updateType: "COMMENT",
      });
      setContent("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to post comment"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    setError("");

    try {
      await submitUpdate({
        taskId,
        updateType: "APPROVAL",
        newStatus: "APPROVED",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve task"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!content.trim()) {
      setError("Please provide feedback for requested changes");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await submitUpdate({
        taskId,
        content: content.trim(),
        updateType: "REJECTION",
        newStatus: "IN_PROGRESS",
      });
      setContent("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to request changes"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Member UI */}
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

      {/* Board/Admin UI */}
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

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
        {error}
      </div>}
    </div>
  );
}
