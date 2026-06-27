"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type RouteErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
  title: string;
  description: string;
};

export function RouteError({ error, unstable_retry, title, description }: RouteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const showDigest = process.env.NODE_ENV !== "production" && error.digest;

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-[#2a1a18] bg-[#0a0705]">
        <CardHeader className="gap-3 border-b border-[#1e1e24] py-4">
          {/* Error icon: red, squared — system fault indicator */}
          <div className="flex size-7 items-center justify-center rounded-sm border border-[#5a1a18] bg-[#1a0804] text-[#e8241a]">
            <AlertCircle className="size-3.5" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-[13px] font-semibold tracking-[-0.02em] text-[#e2e2ea]">
              {title}
            </CardTitle>
            <CardDescription className="text-[11px] text-[#52525f]">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 py-4">
          <Button onClick={unstable_retry} size="sm" className="w-fit gap-1.5">
            <RefreshCcw className="size-3" />
            Retry
          </Button>
          {showDigest ? (
            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#3a3a44]">
              Fault ID: {error.digest}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
