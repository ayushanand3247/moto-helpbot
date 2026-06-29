import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";
import { ProfileWithSubsystem } from "@/types/profile";

type Props = {
  children: ReactNode;
  profile: ProfileWithSubsystem;
};

export function AppShell({
  children,
  profile,
}: Props) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — permanent on desktop */}
      <div className="hidden md:flex">
        <AppSidebar profile={profile} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar profile={profile} />

        <main className="flex-1 p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
