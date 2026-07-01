"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/actions/admin/update-user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  subsystem_id: string | null;
  position: string | null;
  is_active: boolean | null;
  subsystems?: { id: string; name: string } | null;
};

type Subsystem = {
  id: string;
  name: string;
};

type Props = {
  user: User;
  subsystems: Subsystem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ROLES = [
  { value: "MEMBER", label: "Member" },
  { value: "SUBSYSTEM_LEAD", label: "Subsystem Lead" },
  { value: "CAPTAIN", label: "Captain" },
  { value: "TEAM_MANAGER", label: "Team Manager" },
  { value: "ADMIN", label: "Admin" },
];

export function EditUserModal({ user, subsystems, open, onOpenChange }: Props) {
  const [role, setRole] = useState(user.role);
  const [subsystemId, setSubsystemId] = useState(user.subsystem_id || "");
  const [position, setPosition] = useState(user.position || "");
  const [isActive, setIsActive] = useState(user.is_active !== false);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const result = await updateUser({
      userId: user.id,
      role: role as any,
      subsystem_id: subsystemId || null,
      position: position || null,
      is_active: isActive,
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    onOpenChange(false);
    router.refresh();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Reset to original values on close
      setRole(user.role);
      setSubsystemId(user.subsystem_id || "");
      setPosition(user.position || "");
      setIsActive(user.is_active !== false);
      setError("");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name (read-only) */}
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">Name</label>
            <div className="h-7 flex items-center px-2.5 rounded-sm border border-[#222228] bg-[#0a0a0e] font-mono text-[11px] text-foreground">
              {user.full_name}
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">Email</label>
            <div className="h-7 flex items-center px-2.5 rounded-sm border border-[#222228] bg-[#0a0a0e] font-mono text-[11px] text-muted-foreground">
              {user.email}
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-7 w-full rounded-sm border border-[#222228] bg-[#0a0a0e] px-2.5 font-mono text-[11px] text-foreground outline-none focus-visible:border-moto-cyan/40"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Subsystem */}
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">Subsystem</label>
            <select
              value={subsystemId}
              onChange={(e) => setSubsystemId(e.target.value)}
              className="h-7 w-full rounded-sm border border-[#222228] bg-[#0a0a0e] px-2.5 font-mono text-[11px] text-foreground outline-none focus-visible:border-moto-cyan/40"
            >
              <option value="">Unassigned</option>
              {subsystems.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Position (free text) */}
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">Position</label>
            <Input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Structures Lead, CAD Engineer…"
              className="h-7 font-mono text-[11px]"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">Status</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={`h-7 rounded-sm border px-3 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors ${
                  isActive
                    ? "border-[#84cc16]/30 bg-[#84cc16]/10 text-[#84cc16]"
                    : "border-[#222228] bg-[#0a0a0e] text-muted-foreground/70 hover:text-muted-foreground"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={`h-7 rounded-sm border px-3 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors ${
                  !isActive
                    ? "border-border bg-[#0a0a0e] text-foreground"
                    : "border-[#222228] bg-[#0a0a0e] text-muted-foreground/70 hover:text-muted-foreground"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-sm border border-[#e8241a]/30 bg-[#e8241a]/5 px-3 py-2">
              <p className="text-[10px] text-[#e8241a]">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
