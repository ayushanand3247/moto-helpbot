"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatFileSize } from "@/lib/formatFileSize";

type AttachmentMeta = {
  file_name: string;
  file_url: string;
  file_type?: string | null;
  file_size_bytes?: number | null;
};

export default function UpdateForm({ taskId }: { taskId: string }) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const allowedExtensions = ["pdf", "dwg", "step", "stp", "stl"];

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const selected = e.target.files;
    if (!selected) return;
    const arr = Array.from(selected);
    if (arr.length + files.length > 5) {
      setError("Maximum 5 files allowed");
      return;
    }
    for (const f of arr) {
      if (f.size > 25 * 1024 * 1024) {
        setError(`${f.name} exceeds 25MB`);
        return;
      }
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      if (!f.type.startsWith("image/") && f.type !== "application/pdf" && !allowedExtensions.includes(ext)) {
        setError(`${f.name} has unsupported file type`);
        return;
      }
    }
    setFiles((s) => [...s, ...arr]);
    e.currentTarget.value = "";
  }

  function removeFile(idx: number) {
    setFiles((s) => s.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setUploading(true);
    const uploaded: AttachmentMeta[] = [];

    // Upload files to Supabase Storage from the browser
    const supabase = createClient();

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // Use anonymous path; server will record uploaded_by based on session
      const timestamp = Math.floor(Date.now() / 1000);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || "anonymous";
      const path = `task-attachments/${userId}/${taskId}/${timestamp}_${f.name}`;

      const { error: upError } = await supabase.storage
        .from("task-attachments")
        .upload(path, f, { cacheControl: "3600", upsert: false });

      if (upError) {
        setError(upError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("task-attachments").getPublicUrl(path);
      uploaded.push({ file_name: f.name, file_url: urlData.publicUrl, file_type: f.type, file_size_bytes: f.size });
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    // Call server API to create task update and insert attachments.
    try {
      const res = await fetch("/api/tasks/create-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, content, attachments: uploaded }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data?.message || "Failed to create update");
        setUploading(false);
        return;
      }
    } catch (err: any) {
      setError(err.message || "Failed to create update");
      setUploading(false);
      return;
    }

    setContent("");
    setFiles([]);
    setUploading(false);
    setProgress(0);
    // optionally refresh data via router or mutate
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write an update..." />

      <div>
        <input type="file" multiple onChange={onFileChange} />
        <div>
          {files.map((f, i) => (
            <div key={i}>
              <span>{f.name}</span>
              <span>{formatFileSize(f.size)}</span>
              <button type="button" onClick={() => removeFile(i)} disabled={uploading}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {uploading && <div>Uploading... {progress}%</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit" disabled={uploading}>
        Submit Update
      </button>
    </form>
  );
}
