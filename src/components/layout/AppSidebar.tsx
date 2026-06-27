"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  Layers,
  Settings,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";
import { navigation } from "@/lib/constants/navigation";
import { nameToSlug } from "@/lib/subsystems/slug";
import { cn } from "@/lib/utils";

type Subsystem = {
  id: string;
  name: string;
  color: string | null;
};

type Props = {
  profile: {
    role: string;
  };
  subsystems: Subsystem[];
};

const navIcons: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/projects": FolderKanban,
  "/tasks": CheckSquare,
  "/team": Users,
  "/settings": Settings,
  "/analytics": BarChart3,
  "/admin": Shield,
};

export function AppSidebar({ profile, subsystems }: Props) {
  const pathname = usePathname();
  const [subsystemsOpen, setSubsystemsOpen] = useState(true);

  const visibleItems = navigation.filter((item) =>
    item.roles.includes(profile.role as "ADMIN" | "BOARD" | "MEMBER")
  );

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-14 items-center border-b border-zinc-800 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-red-600">
            <span className="text-[10px] font-bold text-white">M</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            MotoManipal
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = navIcons[item.href];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
                isActive
                  ? "bg-zinc-900 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-red-600" />
              )}
              {Icon && (
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-400"
                  )}
                />
              )}
              {item.title}
            </Link>
          );
        })}

        {subsystems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <button
              onClick={() => setSubsystemsOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-400"
            >
              <span className="flex items-center gap-2">
                <Layers className="size-3.5" />
                Subsystems
              </span>
              {subsystemsOpen ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </button>

            {subsystemsOpen && (
              <div className="mt-0.5 flex flex-col gap-0.5">
                {subsystems.map((sub) => {
                  const slug = nameToSlug(sub.name);
                  const href = `/subsystems/${slug}`;
                  const isActive = pathname === href;
                  const color = sub.color || "#71717a";

                  return (
                    <Link
                      key={sub.id}
                      href={href}
                      className={cn(
                        "group relative flex items-center gap-2 rounded-md py-1.5 pl-7 pr-2.5 text-[13px] transition-colors duration-150",
                        isActive
                          ? "bg-zinc-900 font-medium text-zinc-100"
                          : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-red-600" />
                      )}
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate">{sub.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}
