import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-1.5 border-b border-[#1a1a20] pb-4">
      <Skeleton className="h-5 w-44 rounded-sm" />
      <Skeleton className="h-3 w-64 rounded-sm" />
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="space-y-2.5 rounded-sm border border-[#1e1e24] bg-[#0a0a0d] p-3.5">
      <Skeleton className="h-3.5 w-3/5 rounded-sm" />
      <div className="flex gap-1.5">
        <Skeleton className="h-4 w-12 rounded-sm" />
        <Skeleton className="h-4 w-14 rounded-sm" />
      </div>
      <Skeleton className="h-2.5 w-3/4 rounded-sm" />
      <Skeleton className="h-2.5 w-2/5 rounded-sm" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-sm border border-[#1e1e24]">
      {/* Header */}
      <div
        className="grid border-b border-[#1e1e24] bg-[#070709] px-3 py-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-2 w-14 rounded-sm" />
        ))}
      </div>
      {/* Rows */}
      <div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid border-b border-[#1a1a20] px-3 py-2 last:border-0"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-3 rounded-sm"
                style={{ width: `${55 + Math.floor((rowIndex * 13 + colIndex * 7) % 35)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="w-full max-w-7xl space-y-6 p-6 mx-auto">
      <PageHeaderSkeleton />
      <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-sm" />
        ))}
      </div>
      <div className="space-y-px">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 rounded-none first:rounded-t-sm last:rounded-b-sm" />
        ))}
      </div>
    </div>
  );
}
