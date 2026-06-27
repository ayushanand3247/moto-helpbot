import { PageHeaderSkeleton } from "@/components/ui/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="space-y-4">
          <div className="h-6 w-40 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-10 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-10 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-10 animate-pulse rounded-lg bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

