"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation } from "@/lib/constants/navigation";

type Props = {
  profile: {
    role: "ADMIN" | "BOARD" | "MANAGER" | "MEMBER";
  };
};

export function AppSidebar({ profile }: Props) {
  const pathname = usePathname();

  const visibleItems = navigation.filter((item) => {
    const roleString = profile.role as "ADMIN" | "BOARD" | "MANAGER" | "MEMBER";
    return item.roles.includes(roleString);
  });

  return (
    <aside className="w-56 flex flex-col border-r border-border/40 bg-sidebar">
      {/* Brand mark */}
      <div className="h-14 flex items-center px-5 border-b border-border/30">
        <Image
          src="/moto-logo.jpg"
          alt="MotoManipal"
          width={120}
          height={32}
          priority
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* Navigation items */}
      <nav className="flex-1 flex flex-col gap-0.5 p-2 mt-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.8rem] font-medium tracking-wide transition-all duration-150 ${
                isActive
                  ? "bg-moto-cyan/10 text-moto-cyan border-l-2 border-moto-cyan -ml-[2px] pl-[calc(0.625rem+2px)]"
                  : "text-sidebar-foreground hover:text-foreground/90 hover:bg-muted/50"
              }`}
            >
              <Icon className={`size-4 ${isActive ? "text-moto-cyan" : "text-muted-foreground/70 group-hover:text-foreground/70"}`} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom rule — precision edge */}
      <div className="px-5 py-3 border-t border-border/30">
        <p className="text-[0.6rem] font-mono tracking-widest uppercase text-muted-foreground/70">
          v0.1.0
        </p>
      </div>
    </aside>
  );
}
