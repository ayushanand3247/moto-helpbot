"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type SubsystemKey =
  | "Structures"
  | "Transmission"
  | "Vehicle Dynamics"
  | "Aerodynamics"
  | "EPT (Electrical, Powertrain & Telemetry)"
  | "Machine Learning"
  | "Management";

type SubsystemMeta = {
  arcColor: string;
  pillClass: string;
  iconLabel: string; // single-letter or short code for the ring centre
};

const SUBSYSTEM_META: Record<SubsystemKey, SubsystemMeta> = {
  "Structures":                              { arcColor: "#60a5fa", pillClass: "sub-pill-structures",  iconLabel: "ST" },
  "Transmission":                            { arcColor: "#f97316", pillClass: "sub-pill-transmission",iconLabel: "TR" },
  "Vehicle Dynamics":                        { arcColor: "#e879f9", pillClass: "sub-pill-vd",          iconLabel: "VD" },
  "Aerodynamics":                            { arcColor: "#2dd4bf", pillClass: "sub-pill-aero",        iconLabel: "AE" },
  "EPT (Electrical, Powertrain & Telemetry)": { arcColor: "#84cc16", pillClass: "sub-pill-ept",        iconLabel: "EP" },
  "Machine Learning":                        { arcColor: "#a78bfa", pillClass: "sub-pill-ml",          iconLabel: "ML" },
  "Management":                              { arcColor: "#fb923c", pillClass: "sub-pill-management",  iconLabel: "MG" },
};

type Avatar = {
  initials: string;
  name?: string;
};

type SubsystemCardProps = {
  subsystem: SubsystemKey;
  progress: number; // 0–100
  taskCount: number;
  avatars?: Avatar[];
  extraCount?: number;
  href?: string;
  className?: string;
};

export function SubsystemCard({
  subsystem,
  progress,
  taskCount,
  avatars = [],
  extraCount = 0,
  href = "#",
  className,
}: SubsystemCardProps) {
  const meta = SUBSYSTEM_META[subsystem];
  const arcPct = `${Math.min(100, Math.max(0, progress))}%`;

  return (
    <a
      href={href}
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-sm border border-[#1e1e24] bg-[#0a0a0d] p-5",
        "transition-colors duration-100 hover:border-[#2a2a32] hover:bg-[#0d0d11]",
        className
      )}
    >
      {/* ── Header row ─────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-semibold tracking-[-0.02em] text-[#e2e2ea]">
          {subsystem}
        </p>
        <ChevronRight className="size-3.5 text-[#6a6a78] transition-colors group-hover:text-[#8a8a98]" strokeWidth={1.75} />
      </div>

      {/* ── Arc progress ring ──────────────────────────── */}
      <div className="flex items-center justify-center">
        {/*
          Arc ring: conic-gradient from arc colour to border colour.
          The inner div creates the "donut hole" effect.
          This is the provision slot for subsystem progress data.
          Wire up `progress` from your Supabase query.
        */}
        <div
          className="arc-ring relative flex items-center justify-center"
          style={{
            "--arc-pct": arcPct,
            "--arc-color": meta.arcColor,
            width: 72,
            height: 72,
          } as React.CSSProperties}
        >
          {/* Donut hole */}
          <div
            className="arc-ring-inner absolute flex items-center justify-center"
            style={{ width: 52, height: 52 }}
          >
            <span
              className="font-mono text-[14px] font-bold"
              style={{ color: meta.arcColor }}
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer: task count + avatars ──────────────── */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#8a8a98]">
          {taskCount} tasks
        </p>

        {/* Avatar stack */}
        {avatars.length > 0 && (
          <div className="flex -space-x-1.5">
            {avatars.slice(0, 4).map((av, i) => (
              <div
                key={i}
                className="flex size-5 items-center justify-center rounded-sm border border-[#050507] bg-[#14141a] font-mono text-[7px] font-semibold uppercase text-[#8a8a98] ring-[1.5px] ring-[#050507]"
                title={av.name}
              >
                {av.initials}
              </div>
            ))}
            {extraCount > 0 && (
              <div className="flex size-5 items-center justify-center rounded-sm border border-[#050507] bg-[#1a1a20] font-mono text-[7px] font-semibold text-[#6a6a78] ring-[1.5px] ring-[#050507]">
                +{extraCount}
              </div>
            )}
          </div>
        )}
      </div>
    </a>
  );
}

/**
 * SubsystemPill — use this in task tables for the subsystem column.
 * Replaces all generic badges for subsystem values.
 */
export function SubsystemPill({
  subsystem,
  className,
}: {
  subsystem: SubsystemKey | string;
  className?: string;
}) {
  const meta = SUBSYSTEM_META[subsystem as SubsystemKey];
  if (!meta) {
    return (
      <span className={cn(
        "inline-flex h-4 items-center rounded-sm border border-[#28282e] bg-transparent px-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-[#8a8a98]",
        className
      )}>
        {subsystem}
      </span>
    );
  }
  return (
    <span className={cn(
      "inline-flex h-4 items-center rounded-sm border px-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.08em]",
      meta.pillClass,
      className
    )}>
      {subsystem}
    </span>
  );
}
