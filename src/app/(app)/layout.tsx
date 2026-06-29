import { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/require-auth";
import { getProfile } from "@/lib/auth/get-profile";
import { Sidebar } from "@/components/ui/Sidebar";

export default async function Layout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();

  const profile = await getProfile();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={
          profile
            ? {
                name: profile.full_name,
                role: profile.role,
                subsystem: profile.subsystems?.name,
              }
            : undefined
        }
      />
      <div className="flex-1 ml-[220px] min-h-screen flex flex-col">
        <div className="flex-1 p-8 lg:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
