import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

import UsersTable from "@/components/UsersTable";
import InviteDialog from "@/components/InviteDialog";

export default async function AdminPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select(`*, subsystems (*)`).order("full_name");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="text-muted-foreground">Administrative tools and system management.</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Management</h2>
        <InviteDialog />
      </div>

      <div>
        <UsersTable users={users || []} />
      </div>
    </div>
  );
}