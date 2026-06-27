import { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/require-auth";
import { getProfile } from "@/lib/auth/get-profile";
import { getAllSubsystems } from "@/lib/subsystems/queries";
import { AppShell } from "@/components/layout/AppShell";

export default async function Layout({ children }: { children: ReactNode }) {
  await requireAuth();

  const [profile, subsystems] = await Promise.all([
    getProfile(),
    getAllSubsystems(),
  ]);

  return (
    <AppShell profile={profile} subsystems={subsystems}>
      {children}
    </AppShell>
  );
}
