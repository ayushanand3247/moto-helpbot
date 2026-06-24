"use client";

import React from "react";
import { formatFileSize } from "@/lib/formatFileSize";

type Attachment = {
  id?: string;
  file_name: string;
  file_url: string;
  file_type?: string | null;
  file_size_bytes?: number | null;
};

export default function TaskTimeline({ updates }: { updates: any[] }) {
  return (
    <div>
      {updates.map((u) => (
        <div key={u.id} style={{ borderBottom: "1px solid #eee", padding: 8 }}>
          <div>{u.content}</div>
          {u.attachments && u.attachments.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {u.attachments.map((a: Attachment) => (
                <div key={a.file_url} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {a.file_type && a.file_type.startsWith("image/") ? (
                    <img src={a.file_url} alt={a.file_name} style={{ width: 120, height: 80, objectFit: "cover" }} />
                  ) : a.file_type === "application/pdf" ? (
                    <div>
                      <div>PDF</div>
                      <a href={a.file_url} target="_blank" rel="noreferrer">
                        {a.file_name}
                      </a>
                      <div>{formatFileSize(a.file_size_bytes)}</div>
                    </div>
                  ) : (
                    <div>
                      <div>CAD File</div>
                      <a href={a.file_url} target="_blank" rel="noreferrer">
                        {a.file_name}
                      </a>
                      <div>{formatFileSize(a.file_size_bytes)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
