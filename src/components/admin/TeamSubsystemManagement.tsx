"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSubsystem, renameSubsystem, deleteSubsystem, updateSubsystem } from "@/actions/admin/subsystems";
import { Plus, Trash2, PenLine, X, Check } from "lucide-react";

type Props = { subsystems: any[] };

const COLORS = ["#e8241a", "#38bdf8", "#22c55e", "#ff6b2b", "#a78bfa", "#f59e0b", "#ec4899", "#14b8a6"];

export function TeamSubsystemManagement({ subsystems }: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createSubsystem({ name: newName.trim() });
    setNewName("");
    setCreating(false);
  };

  const handleRename = async (id: string) => {
    if (!renameVal.trim()) return;
    await renameSubsystem(id, renameVal.trim());
    setRenaming(null);
  };

  const handleDelete = async (id: string) => {
    await deleteSubsystem(id);
    setConfirmDelete(null);
  };

  const handleColor = async (id: string, color: string) => {
    await updateSubsystem(id, { color });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Team & Subsystem Management</h2>
        <button
          onClick={() => setCreating(true)}
          className="flex h-6 items-center gap-1 rounded-sm bg-moto-cyan/10 px-2 font-mono text-[9px] uppercase text-moto-cyan hover:bg-moto-cyan/20"
        >
          <Plus className="size-3" /> Add Subsystem
        </button>
      </div>

      {creating && (
        <div className="flex gap-2 rounded-sm border border-[#1e1e24] bg-[#0a0a0d] p-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Subsystem name"
            className="h-6 flex-1 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/70"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button onClick={handleCreate} className="h-6 rounded-sm bg-moto-cyan/20 px-2 font-mono text-[9px] uppercase text-moto-cyan">Create</button>
          <button onClick={() => setCreating(false)} className="h-6 rounded-sm border border-[#222228] px-2 font-mono text-[9px] uppercase text-muted-foreground">Cancel</button>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {subsystems.map((sub: any) => {
          const memberCount = sub.profiles?.length ?? 0;

          return (
            <Card key={sub.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {renaming === sub.id ? (
                      <div className="flex gap-1">
                        <input value={renameVal} onChange={(e) => setRenameVal(e.target.value)} className="h-5 rounded-sm border border-[#222228] bg-[#0a0a0e] px-1.5 text-xs text-foreground outline-none flex-1" onKeyDown={(e) => e.key === "Enter" && handleRename(sub.id)} />
                        <button onClick={() => handleRename(sub.id)} className="rounded-sm p-0.5 text-[#22c55e]"><Check className="size-3" /></button>
                        <button onClick={() => setRenaming(null)} className="rounded-sm p-0.5 text-muted-foreground"><X className="size-3" /></button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{sub.name}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setRenaming(sub.id); setRenameVal(sub.name); }} className="rounded-sm p-1 text-muted-foreground/70 hover:text-foreground"><PenLine className="size-3" /></button>
                    {confirmDelete === sub.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(sub.id)} className="rounded-sm px-1 font-mono text-[8px] uppercase bg-[#e8241a]/10 text-[#e8241a]">Yes</button>
                        <button onClick={() => setConfirmDelete(null)} className="rounded-sm px-1 font-mono text-[8px] uppercase text-muted-foreground">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(sub.id)} className="rounded-sm p-1 text-muted-foreground/70 hover:text-[#e8241a]"><Trash2 className="size-3" /></button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-mono text-[10px] text-muted-foreground">{memberCount} member{memberCount !== 1 ? "s" : ""}</p>

                {/* Color picker */}
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[9px] text-muted-foreground/70 mr-1">Color:</span>
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleColor(sub.id, c)}
                      className={`size-3.5 rounded-full border ${sub.color === c ? "border-foreground" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
