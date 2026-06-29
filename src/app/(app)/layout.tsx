import { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/require-auth";
import { Sidebar } from "@/components/ui/Sidebar";

export default async function Layout({
  children,
}: {
  children: ReactNode;
}) {
  // Auth check only — no profile fetch here (fetched client-side by Sidebar)
  await requireAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[220px] min-h-screen flex flex-col">
        <div className="flex-1 p-8 lg:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
