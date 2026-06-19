import { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/require-auth";
import { getProfile } from "@/lib/auth/get-profile";
import { AppShell } from "@/components/layout/AppShell";

export default async function Layout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();

  const profile = await getProfile();

  return (
    <AppShell profile={profile}>
      {children}
    </AppShell>
  );
}