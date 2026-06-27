import { PageHeaderSkeleton, TaskCardSkeleton } from "@/components/ui/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <div className="space-y-6">
        <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="h-6 w-56 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-4 w-80 animate-pulse rounded-lg bg-zinc-800" />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <TaskCardSkeleton key={index} />
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="h-6 w-56 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-4 w-80 animate-pulse rounded-lg bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

