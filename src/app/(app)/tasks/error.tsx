"use client";

import { RouteError } from "@/components/ui/route-error";

export default function Error({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <RouteError
      error={error}
      unstable_retry={unstable_retry}
      title="Tasks unavailable"
      description="The tasks view could not finish loading. Retry to refresh the task list."
    />
  );
}

