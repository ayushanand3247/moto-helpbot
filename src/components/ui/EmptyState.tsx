import type { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-[#1e1e24] bg-transparent hover:border-[#2a2a32]">
      <CardHeader className="items-center py-10 text-center">
        {Icon ? (
          <div className="mb-4 flex size-8 items-center justify-center rounded-sm border border-[#1e1e24] bg-[#0a0a0d] text-[#3a3a44]">
            <Icon className="size-3.5" aria-hidden="true" />
          </div>
        ) : null}
        <CardTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#52525f]">
          {title}
        </CardTitle>
        <CardDescription className="max-w-xs font-mono text-[10px] uppercase tracking-[0.06em] text-[#3a3a44]">
          {description}
        </CardDescription>
      </CardHeader>
      {action ? (
        <CardContent className="flex justify-center pb-10 pt-0">{action}</CardContent>
      ) : null}
    </Card>
  );
}
