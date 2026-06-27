import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Inputs: dark background, crisp border, no decoration.
        // On focus: red left-edge stripe — the active channel signal.
        "h-7 w-full min-w-0 rounded-sm border border-[#222228] bg-[#0a0a0e] px-2.5 py-1 text-[12px] text-[#c8c8d0] transition-colors outline-none",
        // File input
        "file:inline-flex file:h-4 file:border-0 file:bg-transparent file:font-mono file:text-[10px] file:font-medium file:text-[#5a5a6a] file:uppercase file:tracking-[0.06em]",
        // Placeholder: very dim — doesn't compete with actual data
        "placeholder:text-[#2e2e36] placeholder:font-mono placeholder:text-[11px]",
        // Hover
        "hover:border-[#2a2a32]",
        // Focus: left-edge red stripe + subtle red border glow
        "focus-visible:border-[#e8241a]/50 focus-visible:shadow-[inset_2px_0_0_#e8241a,0_0_0_1px_rgba(232,36,26,0.08)]",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-35",
        // Error state
        "aria-invalid:border-[#e8241a]/60 aria-invalid:shadow-[inset_2px_0_0_#e8241a,0_0_0_1px_rgba(232,36,26,0.1)]",
        className
      )}
      {...props}
    />
  );
}

export { Input };
