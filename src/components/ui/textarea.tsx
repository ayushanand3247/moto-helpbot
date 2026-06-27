import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[4.5rem] w-full rounded-sm border border-[#222228] bg-[#0a0a0e] px-2.5 py-2 text-[12px] text-[#c8c8d0] transition-colors outline-none",
        "placeholder:text-[#2e2e36] placeholder:font-mono placeholder:text-[11px]",
        "hover:border-[#2a2a32]",
        "focus-visible:border-[#e8241a]/50 focus-visible:shadow-[inset_2px_0_0_#e8241a,0_0_0_1px_rgba(232,36,26,0.08)]",
        "disabled:cursor-not-allowed disabled:opacity-35",
        "aria-invalid:border-[#e8241a]/60 aria-invalid:shadow-[inset_2px_0_0_#e8241a,0_0_0_1px_rgba(232,36,26,0.1)]",
        "resize-y",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
