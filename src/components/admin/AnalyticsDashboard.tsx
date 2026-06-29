"use client";

import { Users, FolderKanban, CheckSquare, AlertTriangle, FileIcon, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { analytics: any };

const metrics = [
  { key: "totalMembers", label: "Total Members", icon: Users, color: "text-moto-cyan" },
  { key: "activeMembers", label: "Active Members", icon: Users, color: "text-[#22c55e]" },
  { key: "totalProjects", label: "Total Projects", icon: FolderKanban, color: "text-moto-cyan" },
  { key: "activeProjects", label: "Active Projects", icon: FolderKanban, color: "text-[#22c55e]" },
  { key: "completedProjects", label: "Completed Projects", icon: FolderKanban, color: "text-[#22c55e]" },
  { key: "totalTasks", label: "Total Tasks", icon: CheckSquare, color: "text-moto-cyan" },
  { key: "completedTasks", label: "Completed Tasks", icon: CheckSquare, color: "text-[#22c55e]" },
  { key: "overdueTasks", label: "Overdue Tasks", icon: AlertTriangle, color: "text-[#e8241a]" },
  { key: "completionRate", label: "Completion Rate", icon: TrendingUp, color: "text-[#38bdf8]", suffix: "%" },
  { key: "totalFiles", label: "Files Uploaded", icon: FileIcon, color: "text-muted-foreground" },
];

export function AnalyticsDashboard({ analytics }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Platform Overview</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {metrics.map((m) => {
          const Icon = m.icon;
          const value = analytics?.[m.key] ?? 0;
          return (
            <Card key={m.key}>
              <CardHeader className="pb-2">
                <CardTitle className="!text-[9px] flex items-center gap-1">
                  <Icon className={cn("size-3", m.color)} strokeWidth={1.75} />
                  {m.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn("text-2xl font-bold font-mono tracking-tight", m.color)}>
                  {value}{m.suffix ?? ""}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function cn(...args: any[]) {
  return args.filter(Boolean).join(" ");
}
