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
    <div className="flex min-h-screen">
      <div className="hidden md:block">
      <AppSidebar profile={profile} />
      </div>

      <div className="flex-1">
        <TopNavbar profile={profile} />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}