"use client";

import { useState } from "react";
import { deleteProject } from "@/actions/projects/delete-project";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  onSuccess?: () => void;
};

export function DeleteProjectDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  onSuccess,
}: Props) {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const canDelete = confirmText === "DELETE";

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setError("");
    try {
      const result = await deleteProject(projectId);
      if (result?.error) {
        setError(result.error);
        setDeleting(false);
        return;
      }
      onOpenChange(false);
      // Notify parent to remove card immediately
      onSuccess?.();
      router.push("/projects");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete project");
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-sm border border-[#222228] bg-[#0d0d11] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Delete Project
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70 mt-1">
            {projectTitle}
          </p>
        </div>

        {/* Warning */}
        <div className="rounded-sm border border-[#e8241a]/20 bg-[#e8241a]/5 p-3 mb-4 space-y-2">
          <p className="text-xs text-[#e8241a]">
            This will permanently delete this project and all associated data.
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground pl-3">
            <li className="flex items-center gap-1.5"><span className="text-muted-foreground/70">&#8226;</span> Project</li>
            <li className="flex items-center gap-1.5"><span className="text-muted-foreground/70">&#8226;</span> Tasks</li>
            <li className="flex items-center gap-1.5"><span className="text-muted-foreground/70">&#8226;</span> Task updates</li>
            <li className="flex items-center gap-1.5"><span className="text-muted-foreground/70">&#8226;</span> Attachments</li>
            <li className="flex items-center gap-1.5"><span className="text-muted-foreground/70">&#8226;</span> Timeline entries</li>
          </ul>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#e8241a]/70">
            This action cannot be undone.
          </p>
        </div>

        {/* Confirm input */}
        <div className="space-y-1.5 mb-4">
          <label className="text-xs text-muted-foreground">
            Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="h-8 w-full rounded-sm border border-[#222228] bg-[#0a0a0e] px-3 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:border-moto-cyan/40"
          />
        </div>

        {error && (
          <p className="text-xs text-[#e8241a] mb-3">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => { setConfirmText(""); setError(""); onOpenChange(false); }}
            className="h-7 rounded-sm border border-[#2a2a32] px-3 font-mono text-[10px] uppercase tracking-[0.06em] text-[#8a8a98] hover:text-[#b8b8c4]"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className="h-7 rounded-sm bg-[#e8241a] px-3 font-mono text-[10px] uppercase tracking-[0.06em] text-white hover:bg-[#d41e16] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting…" : "Delete Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
