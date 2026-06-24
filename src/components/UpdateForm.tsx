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

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      setError("Unauthorized");
      return;
    }

    setUploading(true);
    const uploaded: AttachmentMeta[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const timestamp = Math.floor(Date.now() / 1000);
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

    // Insert task update and attachments using Supabase client
    const { data: createdUpdate, error: updateErr } = await supabase
      .from("task_updates")
      .insert([
        {
          task_id: taskId,
          content: content || null,
          author_id: userId,
        },
      ])
      .select("id")
      .single();

    if (updateErr || !createdUpdate) {
      setError(updateErr?.message || "Failed to create update");
      setUploading(false);
      return;
    }

    const updateId = createdUpdate.id as string;

    if (uploaded.length > 0) {
      const attachmentsToInsert = uploaded.map((a) => ({
        file_name: a.file_name,
        file_url: a.file_url,
        file_type: a.file_type || null,
        file_size_bytes: a.file_size_bytes || null,
        update_id: updateId,
        uploaded_by: userId,
      }));

      const { error: attachError } = await supabase.from("attachments").insert(attachmentsToInsert);

      if (attachError) {
        setError(attachError.message);
        setUploading(false);
        return;
      }

      // log activities
      for (const a of attachmentsToInsert) {
        await supabase.from("activity_logs").insert([
          {
            action: "ATTACHMENT_UPLOADED",
            actor_id: userId,
            entity_type: "task",
            entity_id: taskId,
            metadata: { filename: a.file_name },
          },
        ]);
      }
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
