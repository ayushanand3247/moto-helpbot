import { PageHeaderSkeleton, TaskCardSkeleton, TableSkeleton } from "@/components/ui/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto w-full">
      <PageHeaderSkeleton />
      <div className="space-y-4">
        <div className="h-8 w-44 animate-pulse rounded-lg bg-zinc-800" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <TaskCardSkeleton key={index} />
          ))}
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <TableSkeleton rows={4} columns={4} />
        <TableSkeleton rows={4} columns={2} />
      </div>
    </div>
  );
}

