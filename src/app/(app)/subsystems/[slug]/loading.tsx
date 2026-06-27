import { PageHeaderSkeleton, TaskCardSkeleton } from "@/components/ui/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto w-full">
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <TaskCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

