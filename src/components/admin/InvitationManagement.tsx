"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { sendInvitation, cancelInvitation, resendInvitation } from "@/actions/admin/invitations";
import { Plus, X, Copy, RefreshCw, Trash2 } from "lucide-react";

type Props = { invitations: any[]; subsystems: any[] };

const ROLES = ["ADMIN", "TEAM_MANAGER", "CAPTAIN", "SUBSYSTEM_LEAD", "MEMBER"];

function getInvStatus(inv: any): string {
  if (inv.accepted_at) return "Accepted";
  if (new Date(inv.expires_at) < new Date()) return "Expired";
  return "Pending";
}

const statusVariant: Record<string, "success" | "outline" | "warning"> = {
  Accepted: "success",
  Expired: "warning",
  Pending: "outline",
};

export function InvitationManagement({ invitations, subsystems }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", role: "MEMBER", subsystem_id: "" });
  const [copied, setCopied] = useState<string | null>(null);

  const byStatus = {
    pending: invitations.filter((i) => getInvStatus(i) === "Pending"),
    accepted: invitations.filter((i) => getInvStatus(i) === "Accepted"),
    expired: invitations.filter((i) => getInvStatus(i) === "Expired"),
  };

  const handleSend = async () => {
    if (!form.email.trim()) return;
    await sendInvitation({
      email: form.email,
      full_name: form.full_name,
      role: form.role,
      subsystem_id: form.subsystem_id || undefined,
    });
    setForm({ email: "", full_name: "", role: "MEMBER", subsystem_id: "" });
    setShowCreate(false);
    router.refresh();
  };

  const handleCopyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Invitation Management</h2>
        <button onClick={() => setShowCreate(true)} className="flex h-6 items-center gap-1 rounded-sm bg-moto-cyan/10 px-2 font-mono text-[9px] uppercase text-moto-cyan hover:bg-moto-cyan/20">
          <Plus className="size-3" /> Send Invitation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", value: byStatus.pending.length },
          { label: "Accepted", value: byStatus.accepted.length },
          { label: "Expired", value: byStatus.expired.length },
        ].map((s) => (
          <div key={s.label} className="rounded-sm border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#6a6a78]">{s.label}</p>
            <p className="font-mono text-xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-sm border border-[#1e1e24] bg-[#0a0a0d] p-3 space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">New Invitation</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" type="email" className="h-6 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/70" />
            <input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Full name" className="h-6 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/70" />
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="h-6 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2 text-xs text-foreground outline-none">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={form.subsystem_id} onChange={(e) => setForm((f) => ({ ...f, subsystem_id: e.target.value }))} className="h-6 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2 text-xs text-foreground outline-none">
              <option value="">No subsystem</option>
              {subsystems.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="h-6 rounded-sm border border-[#222228] px-2 font-mono text-[9px] uppercase text-muted-foreground">Cancel</button>
            <button onClick={handleSend} className="h-6 rounded-sm bg-moto-cyan/20 px-2 font-mono text-[9px] uppercase text-moto-cyan">Send</button>
          </div>
        </div>
      )}

      {/* Invitation list */}
      <div className="rounded-sm border border-[#1e1e24] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[#070709]">
            <tr>
              {["Email", "Name", "Role", "Subsystem", "Status", "Sent", "Expires", "Actions"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-mono text-[9px] uppercase tracking-[0.1em] text-[#6a6a78]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv) => {
              const status = getInvStatus(inv);
              return (
                <tr key={inv.id} className="border-b border-[#1e1e24] hover:bg-[#0a0a0d]">
                  <td className="px-3 py-2 font-mono text-foreground">{inv.email}</td>
                  <td className="px-3 py-2 text-muted-foreground">{inv.full_name}</td>
                  <td className="px-3 py-2"><Badge variant="outline">{inv.role}</Badge></td>
                  <td className="px-3 py-2 text-muted-foreground">{inv.subsystems?.name ?? "—"}</td>
                  <td className="px-3 py-2"><Badge variant={statusVariant[status]}>{status}</Badge></td>
                  <td className="px-3 py-2 text-muted-foreground font-mono">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-muted-foreground font-mono">{new Date(inv.expires_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {status === "Pending" && (
                        <>
                          <button onClick={async () => { await resendInvitation(inv.id); router.refresh(); }} className="rounded-sm p-1 text-muted-foreground/70 hover:text-foreground" title="Resend"><RefreshCw className="size-3" /></button>
                          <button onClick={async () => { await cancelInvitation(inv.id); router.refresh(); }} className="rounded-sm p-1 text-muted-foreground/70 hover:text-[#e8241a]" title="Cancel"><Trash2 className="size-3" /></button>
                        </>
                      )}
                      {inv.token && (
                        <button onClick={() => handleCopyLink(inv.token, inv.id)} className="rounded-sm p-1 text-muted-foreground/70 hover:text-foreground" title="Copy link">
                          <Copy className="size-3" />
                        </button>
                      )}
                      {copied === inv.id && <span className="font-mono text-[8px] text-[#22c55e]">Copied!</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {invitations.length === 0 && <div className="py-8 text-center text-xs text-muted-foreground/70">No invitations</div>}
      </div>
    </div>
  );
}
