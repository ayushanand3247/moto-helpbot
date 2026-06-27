import { TableSkeleton } from "@/components/ui/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-800" />
        <TableSkeleton rows={5} columns={4} />
      </div>
    </div>
  );
}

