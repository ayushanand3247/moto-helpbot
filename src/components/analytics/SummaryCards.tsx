import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, ListTodo } from "lucide-react";
import type { OverallTaskStats } from "@/lib/analytics/types";

type Props = {
  stats: OverallTaskStats;
};

const cards = [
  {
    key: "total" as const,
    label: "Total Tasks",
    icon: ListTodo,
  },
  {
    key: "completed" as const,
    label: "Completed",
    icon: CheckCircle2,
  },
  {
    key: "active" as const,
    label: "Active Tasks",
    icon: Circle,
  },
  {
    key: "overdue" as const,
    label: "Overdue",
    icon: Clock,
  },
];

export function SummaryCards({ stats }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {label}
            </CardTitle>
            <Icon className="size-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight text-zinc-100">
              {stats[key]}
            </p>
            {key === "overdue" && stats.overdue > 0 && (
              <p className="mt-1 text-xs text-red-400">Needs attention</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
