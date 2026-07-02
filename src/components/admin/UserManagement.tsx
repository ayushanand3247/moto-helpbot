"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Search, X, Pencil } from "lucide-react";
import { removeUser } from "@/actions/admin/users";
import { EditUserModal } from "@/components/admin/EditUserModal";

type Subsystem = {
  id: string;
  name: string;
};

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  subsystem_id: string | null;
  position: string | null;
  is_active: boolean | null;
  created_at: string | null;
  subsystems?: Subsystem | null;
};

type Props = { users: User[]; subsystems: Subsystem[] };

const ROLES = ["ADMIN", "BOARD", "MANAGER", "MEMBER"];

const roleVariant: Record<string, "default" | "warning" | "secondary"> = {
  ADMIN: "default",
  BOARD: "warning",
  MANAGER: "warning",
  MEMBER: "secondary",
};

const roleDisplay: Record<string, string> = {
  ADMIN: "Admin",
  BOARD: "Board",
  MANAGER: "Manager",
  MEMBER: "Member",
};

export function UserManagement({ users, subsystems }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterSubs, setFilterSubs] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const [editUser, setEditUser] = useState<User | null>(null);

  const filtered = useMemo(() => {
    let result = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((u) =>
        u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    if (filterRole) result = result.filter((u) => u.role === filterRole);
    if (filterSubs) result = result.filter((u) => u.subsystem_id === filterSubs);
    return result;
  }, [users, search, filterRole, filterSubs]);

  const handleRemove = async (userId: string) => {
    await removeUser(userId);
    setConfirmRemove(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">User Management</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex h-7 w-56 items-center gap-2 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2.5">
          <Search className="size-3 text-[#6a6a78]" strokeWidth={1.75} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-transparent font-mono text-[11px] text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          {search && <button onClick={() => setSearch("")}><X className="size-3 text-muted-foreground/70" /></button>}
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="h-7 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2 font-mono text-[10px] text-foreground outline-none">
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{roleDisplay[r] ?? r}</option>)}
        </select>
        <select value={filterSubs} onChange={(e) => setFilterSubs(e.target.value)} className="h-7 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2 font-mono text-[10px] text-foreground outline-none">
          <option value="">All Subsystems</option>
          {subsystems.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* User list */}
      <div className="rounded-sm border border-[#1e1e24] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[#070709]">
            <tr className="border-b border-[#1e1e24]">
              {["Name", "Email", "Role", "Subsystem", "Position", "Status", "Joined", "Actions"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-mono text-[9px] uppercase tracking-[0.1em] text-[#6a6a78]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-[#1e1e24] hover:bg-[#0a0a0d] transition-colors">
                <td className="px-3 py-2 font-medium text-foreground">{user.full_name}</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">{user.email}</td>
                <td className="px-3 py-2">
                  <Badge variant={roleVariant[user.role] ?? "secondary"} className="text-[8px]">
                    {roleDisplay[user.role] ?? user.role}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-muted-foreground/70">
                  {user.subsystems?.name ?? "Unassigned"}
                </td>
                <td className="px-3 py-2 text-muted-foreground/70">
                  {user.position ?? "—"}
                </td>
                <td className="px-3 py-2">
                  <Badge variant={user.is_active !== false ? "success" : "outline"} className="text-[8px]">
                    {user.is_active !== false ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-muted-foreground font-mono">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditUser(user)}
                      className="rounded-sm px-1.5 py-0.5 font-mono text-[8px] uppercase text-moto-cyan/80 hover:bg-moto-cyan/10 hover:text-moto-cyan transition-colors"
                    >
                      <Pencil className="inline size-3 mr-0.5" strokeWidth={1.75} />
                      Edit
                    </button>
                    {confirmRemove === user.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleRemove(user.id)} className="rounded-sm px-1.5 py-0.5 font-mono text-[8px] uppercase bg-[#e8241a]/10 text-[#e8241a]">Confirm</button>
                        <button onClick={() => setConfirmRemove(null)} className="rounded-sm px-1.5 py-0.5 font-mono text-[8px] uppercase text-muted-foreground">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmRemove(user.id)} className="rounded-sm px-1.5 py-0.5 font-mono text-[8px] uppercase text-[#e8241a]/60 hover:bg-[#e8241a]/10 hover:text-[#e8241a]">Remove</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground/70">No users found</div>
        )}
      </div>

      {/* Edit Modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          subsystems={subsystems}
          open={!!editUser}
          onOpenChange={(open) => { if (!open) setEditUser(null); }}
        />
      )}
    </div>
  );
}
