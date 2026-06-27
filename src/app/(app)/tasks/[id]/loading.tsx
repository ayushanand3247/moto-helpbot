import { PageHeaderSkeleton, TaskCardSkeleton } from "@/components/ui/page-skeletons";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <PageHeaderSkeleton />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
        <div className="space-y-4 rounded-lg border border-zinc-800/80 bg-card p-4">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-zinc-800" />
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-lg bg-zinc-800" />
            <div className="h-24 animate-pulse rounded-lg bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}



