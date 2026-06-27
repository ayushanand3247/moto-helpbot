"use client";

import { RouteError } from "@/components/ui/route-error";

export default function Error({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <RouteError
      error={error}
      unstable_retry={unstable_retry}
      title="Dashboard unavailable"
      description="We hit a snag while loading the dashboard. Try again and the segment will re-fetch."
    />
  );
}

