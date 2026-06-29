"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ROLES = ["Member", "Subsystem Lead", "Captain", "Team Manager", "Admin"] as const;

const PERMISSIONS = [
  { key: "create_project", label: "Create Project", category: "Projects" },
  { key: "delete_project", label: "Delete Project", category: "Projects" },
  { key: "archive_project", label: "Archive Project", category: "Projects" },
  { key: "create_task", label: "Create Task", category: "Tasks" },
  { key: "delete_task", label: "Delete Task", category: "Tasks" },
  { key: "assign_tasks", label: "Assign Tasks", category: "Tasks" },
  { key: "complete_tasks", label: "Complete Tasks", category: "Tasks" },
  { key: "manage_users", label: "Manage Users", category: "Admin" },
  { key: "manage_invitations", label: "Manage Invitations", category: "Admin" },
  { key: "view_analytics", label: "View Analytics", category: "Admin" },
  { key: "access_admin", label: "Access Admin Panel", category: "Admin" },
  { key: "manage_subsystems", label: "Manage Subsystems", category: "Admin" },
  { key: "edit_settings", label: "Edit Settings", category: "Admin" },
] as const;

// Default permission matrix (role → permission → allowed)
const DEFAULT_MATRIX: Record<string, Record<string, boolean>> = {
  "Member":         { create_project: false, delete_project: false, archive_project: false, create_task: true, delete_task: false, assign_tasks: false, complete_tasks: true, manage_users: false, manage_invitations: false, view_analytics: false, access_admin: false, manage_subsystems: false, edit_settings: false },
  "Subsystem Lead": { create_project: true, delete_project: false, archive_project: false, create_task: true, delete_task: false, assign_tasks: true, complete_tasks: true, manage_users: false, manage_invitations: false, view_analytics: true, access_admin: false, manage_subsystems: false, edit_settings: false },
  "Captain":        { create_project: true, delete_project: true, archive_project: true, create_task: true, delete_task: true, assign_tasks: true, complete_tasks: true, manage_users: true, manage_invitations: true, view_analytics: true, access_admin: true, manage_subsystems: true, edit_settings: false },
  "Team Manager":   { create_project: true, delete_project: true, archive_project: true, create_task: true, delete_task: true, assign_tasks: true, complete_tasks: true, manage_users: true, manage_invitations: true, view_analytics: true, access_admin: true, manage_subsystems: true, edit_settings: false },
  "Admin":          { create_project: true, delete_project: true, archive_project: true, create_task: true, delete_task: true, assign_tasks: true, complete_tasks: true, manage_users: true, manage_invitations: true, view_analytics: true, access_admin: true, manage_subsystems: true, edit_settings: true },
};

// Load from localStorage or use defaults
function loadMatrix(): Record<string, Record<string, boolean>> {
  if (typeof window === "undefined") return DEFAULT_MATRIX;
  const stored = localStorage.getItem("admin_permissions");
  return stored ? JSON.parse(stored) : DEFAULT_MATRIX;
}

import { useState } from "react";

export function PermissionsManager() {
  const [matrix, setMatrix] = useState(loadMatrix);
  const [saved, setSaved] = useState(false);

  const toggle = (role: string, perm: string) => {
    setMatrix((m) => ({
      ...m,
      [role]: { ...m[role], [perm]: !m[role]?.[perm] },
    }));
  };

  const handleSave = () => {
    localStorage.setItem("admin_permissions", JSON.stringify(matrix));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const categories = Array.from(new Set(PERMISSIONS.map((p) => p.category)));

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Permissions</h2>

      {categories.map((cat) => {
        const perms = PERMISSIONS.filter((p) => p.category === cat);
        return (
          <Card key={cat}>
            <CardHeader>
              <CardTitle className="!text-xs !text-muted-foreground !uppercase !tracking-wider">{cat}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left font-mono text-[9px] uppercase tracking-[0.1em] text-[#6a6a78]">Permission</th>
                      {ROLES.map((r) => (
                        <th key={r} className="px-2 py-1 text-center font-mono text-[9px] uppercase tracking-[0.1em] text-[#6a6a78] whitespace-nowrap">{r}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {perms.map((perm) => (
                      <tr key={perm.key} className="border-t border-[#1e1e24]">
                        <td className="px-2 py-1.5 text-foreground">{perm.label}</td>
                        {ROLES.map((role) => {
                          const allowed = matrix[role]?.[perm.key] ?? false;
                          const isAdmin = role === "Admin";
                          return (
                            <td key={role} className="px-2 py-1.5 text-center">
                              <button
                                onClick={() => !isAdmin && toggle(role, perm.key)}
                                className={`inline-flex size-4 items-center justify-center rounded-sm border transition-colors ${
                                  allowed
                                    ? "bg-moto-cyan/20 border-moto-cyan/40 text-moto-cyan"
                                    : "bg-[#0a0a0e] border-[#222228] text-transparent"
                                } ${isAdmin ? "cursor-default" : "cursor-pointer hover:border-moto-cyan/60"}`}
                              >
                                ✓
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="h-7 rounded-sm bg-moto-cyan/20 px-3 font-mono text-[10px] uppercase text-moto-cyan hover:bg-moto-cyan/30">
          Save Permissions
        </button>
        {saved && <span className="font-mono text-[10px] text-[#22c55e]">Permissions saved</span>}
      </div>
    </div>
  );
}
