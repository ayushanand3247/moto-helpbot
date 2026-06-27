import { PageHeaderSkeleton, TaskCardSkeleton } from "@/components/ui/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto w-full">
      <PageHeaderSkeleton />
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-800" />
        <div className="h-8 w-28 animate-pulse rounded-lg bg-zinc-800" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <TaskCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

