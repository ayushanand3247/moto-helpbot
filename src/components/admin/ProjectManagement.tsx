"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { updateProject, archiveProject, reopenProject } from "@/actions/admin/projects";
import { deleteProject } from "@/actions/projects/delete-project";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { Search, X, FolderKanban, Archive, RotateCcw, Trash2, Calendar, User } from "lucide-react";

type Props = { projects: any[] };

const statusVariant: Record<string, "default" | "success" | "secondary" | "outline" | "warning"> = {
  PLANNING: "outline",
  ACTIVE: "success",
  COMPLETED: "secondary",
  ARCHIVED: "warning",
};

export function ProjectManagement({ projects }: Props) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");

  const filtered = projects.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
  });

  const counts = {
    total: projects.length,
    active: projects.filter((p) => p.status === "ACTIVE").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
    archived: projects.filter((p) => p.status === "ARCHIVED").length,
  };

  const startEdit = (p: any) => {
    setEditing(p.id);
    setEditTitle(p.title);
    setEditDeadline(p.target_date ? p.target_date.slice(0, 10) : "");
  };

  const saveEdit = async (id: string) => {
    await updateProject(id, { title: editTitle, target_date: editDeadline || null });
    setEditing(null);
  };

  const handleDelete = (p: any) => {
    setDeleteId(p.id);
    setDeleteTitle(p.title);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Project Management</h2>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.total },
          { label: "Active", value: counts.active },
          { label: "Completed", value: counts.completed },
          { label: "Archived", value: counts.archived },
        ].map((s) => (
          <div key={s.label} className="rounded-sm border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#6a6a78]">{s.label}</p>
            <p className="font-mono text-xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex h-7 w-56 items-center gap-2 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2.5">
        <Search className="size-3 text-[#6a6a78]" strokeWidth={1.75} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="w-full bg-transparent font-mono text-[11px] text-foreground outline-none placeholder:text-muted-foreground/70" />
        {search && <button onClick={() => setSearch("")}><X className="size-3 text-muted-foreground/70" /></button>}
      </div>

      {/* Project list */}
      <div className="space-y-2">
        {filtered.map((p) => {
          const pct = p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0;
          const isCompleted = pct === 100 && p.total_tasks > 0;

          return (
            <div key={p.id} className="rounded-sm border border-[#1e1e24] bg-[#0a0a0d] p-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {editing === p.id ? (
                    <div className="flex gap-2">
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-6 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2 text-xs text-foreground outline-none flex-1" />
                      <button onClick={() => saveEdit(p.id)} className="h-6 rounded-sm bg-moto-cyan/20 px-2 font-mono text-[9px] uppercase text-moto-cyan">Save</button>
                      <button onClick={() => setEditing(null)} className="h-6 rounded-sm border border-[#222228] px-2 font-mono text-[9px] uppercase text-muted-foreground">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FolderKanban className="size-3 text-moto-cyan/40" />
                      <p className="text-sm font-medium text-foreground">{p.title}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[p.status] ?? "secondary"}>{p.status}</Badge>
                  <div className="flex gap-1">
                    {editing !== p.id && (
                      <button onClick={() => startEdit(p)} className="rounded-sm p-1 text-muted-foreground/70 hover:text-foreground" title="Edit"><User className="size-3" /></button>
                    )}
                    {p.status !== "ARCHIVED" && p.status !== "COMPLETED" && (
                      <button onClick={() => archiveProject(p.id)} className="rounded-sm p-1 text-muted-foreground/70 hover:text-[#ff6b2b]" title="Archive"><Archive className="size-3" /></button>
                    )}
                    {p.status === "ARCHIVED" && (
                      <button onClick={() => reopenProject(p.id)} className="rounded-sm p-1 text-muted-foreground/70 hover:text-[#22c55e]" title="Reopen"><RotateCcw className="size-3" /></button>
                    )}
                    {isCompleted && (
                      <button onClick={() => handleDelete(p)} className="rounded-sm p-1 text-muted-foreground/70 hover:text-[#e8241a]" title="Delete"><Trash2 className="size-3" /></button>
                    )}
                  </div>
                </div>
              </div>

              {editing === p.id && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-3 text-muted-foreground/70" />
                  <input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="h-6 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2 text-xs text-foreground outline-none" />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {p.total_tasks === 0 ? "No tasks yet" : `${p.completed_tasks} / ${p.total_tasks} Tasks`}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground">{pct}%</span>
                </div>
                <ProgressBar percentage={pct} />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground/70">No projects found</div>
        )}
      </div>

      <DeleteProjectDialog open={!!deleteId} onOpenChange={(o) => { if (!o) { setDeleteId(null); } }} projectId={deleteId ?? ""} projectTitle={deleteTitle} />
    </div>
  );
}
