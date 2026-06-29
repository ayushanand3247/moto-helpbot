"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  percentage: number;
  className?: string;
};

function getProgressColor(pct: number): string {
  if (pct === 100) return "bg-[#22c55e]";
  if (pct >= 76) return "bg-[#38bdf8]";
  if (pct >= 26) return "bg-moto-cyan";
  return "bg-[#8a8a98]";
}

export function ProgressBar({ percentage, className }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDisplay(percentage));
    return () => cancelAnimationFrame(frame);
  }, [percentage]);

  return (
    <div className={cn("h-1.5 w-full rounded-full bg-[#1e1e24]", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500 ease-out", getProgressColor(display))}
        style={{ width: `${display}%` }}
      />
    </div>
  );
}
