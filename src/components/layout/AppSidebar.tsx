"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation } from "@/lib/constants/navigation";

type Props = {
  profile: {
    role: string;
  };
};

export function AppSidebar({ profile }: Props) {
  const pathname = usePathname();

  const visibleItems = navigation.filter((item) =>
    item.roles.includes(
      profile.role as "ADMIN" | "BOARD" | "MEMBER"
    )
  );

  return (
    <aside className="w-64 border-r">
      <nav className="flex flex-col gap-2 p-4">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 transition-colors ${
                isActive
                  ? "bg-muted font-semibold"
                  : "hover:bg-muted/50"
              }`}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}