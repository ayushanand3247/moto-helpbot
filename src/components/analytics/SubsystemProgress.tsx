import { Card, CardContent } from "@/components/ui/card";
import type { SubsystemProgress } from "@/lib/analytics/types";

type Props = {
  subsystems: SubsystemProgress[];
};

export function SubsystemProgress({ subsystems }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subsystems.map((sub) => (
        <Card key={sub.id}>
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center gap-2">
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: sub.color || "#71717a" }}
              />
              <span className="text-sm font-medium tracking-tight text-zinc-200">
                {sub.name}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-400 transition-all duration-500"
                style={{ width: `${sub.percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>
                <span className="font-medium text-zinc-300">{sub.completed}</span>
                {" / "}
                <span className="font-medium text-zinc-300">{sub.total}</span>
                {" tasks"}
              </span>
              <span className="font-mono text-sm text-zinc-300">
                {sub.percentage}%
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      {subsystems.length === 0 && (
        <p className="col-span-full py-12 text-center text-sm text-zinc-500">
          No subsystem data available.
        </p>
      )}
    </div>
  );
}
