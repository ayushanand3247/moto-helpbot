import * as React from "react";

import { cn } from "@/lib/utils";

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        // Instrument panel card:
        // — No border-radius excess. 2px corner only.
        // — Border barely visible: panel seam, not wall.
        // — Top edge slightly brighter: panel face catching ambient light.
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-sm border border-[#1e1e24] bg-card py-(--card-spacing) text-[13px] text-card-foreground [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-[inherit] *:[img:last-child]:rounded-b-[inherit]",
        // Top-edge highlight: one pixel, slightly brighter than the border.
        // This creates the panel-face effect without decoration.
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
        // Hover: border becomes just barely visible. Not animated, no transform.
        "transition-colors duration-100 hover:border-[#2a2a32]",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-0.5 rounded-t-[inherit] px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        // Title: medium weight, tight tracking — not a web app h2, an instrument label
        "text-[13px] font-semibold leading-tight tracking-[-0.02em] text-[#e2e2ea] group-data-[size=sm]/card:text-[12px]",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-[11px] leading-relaxed text-[#52525f]", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        // Footer: noticeably darker, thin hairline separator.
        // Like the base plate of an instrument housing.
        "flex items-center rounded-b-[inherit] border-t border-[#1a1a20] bg-[#070709] p-(--card-spacing)",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
