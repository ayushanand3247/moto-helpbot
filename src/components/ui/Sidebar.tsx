"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { logout } from "@/actions/auth";
import { isAdmin } from "@/lib/roles";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Projects",   href: "/projects",   icon: FolderOpen },
  { label: "Tasks",      href: "/tasks",       icon: CheckSquare },
  { label: "Team",       href: "/team",        icon: Users },
  { label: "Settings",   href: "/settings",    icon: Settings },
  { label: "Admin",      href: "/admin",       icon: ShieldCheck, adminOnly: true },
];

type User = {
  name: string;
  role: "ADMIN" | "BOARD" | "MANAGER" | "MEMBER";
  subsystem?: string;
};

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  // Fetch profile client-side once after hydration
  useEffect(() => {
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setUser({
            name: data.profile.full_name,
            role: data.profile.role,
            subsystem: data.profile.subsystems?.name,
          });
        }
      })
      .catch(() => {});
  }, []);

  const isUserAdmin = isAdmin(user?.role ?? null);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col border-r border-[#111115] bg-[#050507]">

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="flex h-14 items-center border-b border-[#111115] px-4">
        <Image
          src="/moto-logo.jpg"
          alt="MotoManipal"
          width={140}
          height={32}
          priority
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="flex-1 space-y-px px-2 py-3">
        {NAV_ITEMS.filter(item => !item.adminOnly || isUserAdmin).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-sm px-3 py-2 text-[12px] font-medium transition-colors duration-75",
                active
                  ? "bg-[#0e0e12] text-[#e2e2ea] shadow-[inset_2px_0_0_#e8241a]"
                  : "text-[#8a8a98] hover:bg-[#0a0a0d] hover:text-[#b8b8c4]"
              )}
            >
              <item.icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  active ? "text-[#e8241a]" : "text-[#6a6a78] group-hover:text-[#8a8a98]"
                )}
                strokeWidth={1.75}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── User + sign out ───────────────────────────────── */}
      <div className="border-t border-[#111115] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium text-[#c8c8d0]">
              {user?.name ?? "User"}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#6a6a78]">
              {user?.role ?? "MEMBER"} · {user?.subsystem ?? "—"}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-sm p-1.5 text-[#6a6a78] transition-colors hover:bg-[#0e0e12] hover:text-[#e8241a]"
              title="Sign out"
            >
              <LogOut className="size-4" strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
