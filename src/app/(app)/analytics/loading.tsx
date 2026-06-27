import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto w-full">
      <PageHeaderSkeleton />
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-800" />
        <TableSkeleton rows={5} columns={3} />
      </div>
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-800" />
        <TableSkeleton rows={4} columns={2} />
      </div>
    </div>
  );
}

