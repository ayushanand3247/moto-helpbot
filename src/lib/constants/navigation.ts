export type UserRole =
  | "ADMIN"
  | "BOARD"
  | "MEMBER";
  
export type NavigationItem = {
  title: string;
  href: string;
  roles: ("ADMIN" | "BOARD" | "MEMBER")[];
};

export const navigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    roles: ["ADMIN", "BOARD", "MEMBER"],
  },
  {
    title: "Projects",
    href: "/projects",
    roles: ["ADMIN", "BOARD", "MEMBER"],
  },
  {
    title: "Tasks",
    href: "/tasks",
    roles: ["ADMIN", "BOARD", "MEMBER"],
  },
  {
    title: "Team",
    href: "/team",
    roles: ["ADMIN", "BOARD", "MEMBER"],
  },
  {
    title: "Settings",
    href: "/settings",
    roles: ["ADMIN", "BOARD", "MEMBER"],
  },
  {
    title: "Analytics",
    href: "/analytics",
    roles: ["ADMIN", "BOARD"],
  },
  {
    title: "Admin",
    href: "/admin",
    roles: ["ADMIN"],
  },
];
