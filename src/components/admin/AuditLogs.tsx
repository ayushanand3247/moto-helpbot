"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

type Props = { auditLogs: any[] };

const actionColors: Record<string, string> = {
  ROLE_CHANGED: "warning",
  USER_DISABLED: "destructive",
  USER_REACTIVATED: "success",
  USER_REMOVED: "destructive",
  INVITATION_SENT: "outline",
  PROJECT_STATUS_CHANGED: "warning",
  PROGRESS_SUBMITTED: "success",
  TASK_APPROVED: "success",
  CHANGES_REQUESTED: "warning",
  STATUS_CHANGED: "outline",
  COMMENT_ADDED: "outline",
};

export function AuditLogs({ auditLogs }: Props) {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const actionTypes = useMemo(() => {
    const set = new Set(auditLogs.map((l) => l.action));
    return Array.from(set).sort();
  }, [auditLogs]);

  const filtered = useMemo(() => {
    let result = auditLogs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((l) =>
        l.profiles?.full_name?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q)
      );
    }
    if (filterAction) result = result.filter((l) => l.action === filterAction);
    return result;
  }, [auditLogs, search, filterAction]);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Audit Logs</h2>

      <div className="flex flex-wrap gap-2">
        <div className="flex h-7 w-56 items-center gap-2 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2.5">
          <Search className="size-3 text-[#6a6a78]" strokeWidth={1.75} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..." className="w-full bg-transparent font-mono text-[11px] text-foreground outline-none placeholder:text-muted-foreground/70" />
          {search && <button onClick={() => setSearch("")}><X className="size-3 text-muted-foreground/70" /></button>}
        </div>
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="h-7 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2 font-mono text-[10px] text-foreground outline-none">
          <option value="">All Actions</option>
          {actionTypes.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="rounded-sm border border-[#1e1e24] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[#070709]">
            <tr>
              {["Timestamp", "User", "Action", "Target", "Details"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-mono text-[9px] uppercase tracking-[0.1em] text-[#6a6a78]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-[#1e1e24] hover:bg-[#0a0a0d]">
                <td className="px-3 py-2 font-mono text-muted-foreground">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                </td>
                <td className="px-3 py-2 text-foreground">{log.profiles?.full_name ?? "System"}</td>
                <td className="px-3 py-2">
                  <Badge variant={(actionColors[log.action] as any) ?? "outline"} className="text-[8px]">
                    {log.action}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-muted-foreground font-mono">
                  {log.entity_type ?? "—"}{log.entity_id ? ` / ${log.entity_id.slice(0, 8)}` : ""}
                </td>
                <td className="px-3 py-2 text-muted-foreground font-mono max-w-[200px] truncate">
                  {log.metadata ? JSON.stringify(log.metadata) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-8 text-center text-xs text-muted-foreground/70">No logs found</div>}
      </div>
    </div>
  );
}
