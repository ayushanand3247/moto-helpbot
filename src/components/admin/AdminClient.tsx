"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Users, FolderKanban, Cpu, Mail, BarChart3, ScrollText, Settings, ShieldCheck, Upload,
} from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
import { ProjectManagement } from "@/components/admin/ProjectManagement";
import { TeamSubsystemManagement } from "@/components/admin/TeamSubsystemManagement";
import { InvitationManagement } from "@/components/admin/InvitationManagement";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { PermissionsManager } from "@/components/admin/PermissionsManager";
import { BulkUserImport } from "@/components/admin/BulkUserImport";

type Tab = {
  id: string;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
};

const TABS: Tab[] = [
  { id: "analytics", label: "Analytics", icon: BarChart3, component: AnalyticsDashboard },
  { id: "bulk-import", label: "Bulk Import", icon: Upload, component: BulkUserImport },
  { id: "users", label: "Users", icon: Users, component: UserManagement },
  { id: "projects", label: "Projects", icon: FolderKanban, component: ProjectManagement },
  { id: "team", label: "Team & Subsystems", icon: Cpu, component: TeamSubsystemManagement },
  { id: "invitations", label: "Invitations", icon: Mail, component: InvitationManagement },
  { id: "audit", label: "Audit Logs", icon: ScrollText, component: AuditLogs },
  { id: "permissions", label: "Permissions", icon: ShieldCheck, component: PermissionsManager },
  { id: "settings", label: "Settings", icon: Settings, component: SystemSettings },
];

type Props = {
  users: any[];
  projects: any[];
  subsystems: any[];
  invitations: any[];
  analytics: any;
  auditLogs: any[];
};

export function AdminClient({ users, projects, subsystems, invitations, analytics, auditLogs }: Props) {
  const [activeTab, setActiveTab] = useState("analytics");

  const dataMap: Record<string, any> = {
    analytics: { analytics },
    "bulk-import": { subsystems },
    users: { users, subsystems },
    projects: { projects },
    team: { subsystems },
    invitations: { invitations, subsystems },
    audit: { auditLogs },
    permissions: {},
    settings: {},
  };

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component ?? AnalyticsDashboard;

  return (
    <div className="space-y-7 moto-animate-in">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Admin</h1>
        <p className="text-sm text-muted-foreground">Central control panel for MotoManipal.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-[#1e1e24] pb-px -mx-1 px-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-t-sm px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-[#0e0e12] text-foreground border-t-2 border-x border-[#1e1e24] border-t-moto-cyan -mb-px"
                  : "text-muted-foreground/70 hover:text-muted-foreground hover:bg-[#0a0a0d]"
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.75} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <ActiveComponent {...dataMap[activeTab]} />
    </div>
  );
}
