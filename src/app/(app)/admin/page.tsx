import { requireAdmin } from "@/lib/auth/require-admin";
import { getUsers, getPendingInvitations, getSubsystems } from "@/lib/admin/queries";
import { UsersTable } from "@/components/admin/UsersTable";
import { PendingInvitationsTable } from "@/components/admin/PendingInvitationsTable";
import { InviteUserDialog } from "@/components/admin/InviteUserDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default async function AdminPage() {
  const adminProfile = await requireAdmin();

  const [users, invitations, subsystems] = await Promise.all([
    getUsers(),
    getPendingInvitations(),
    getSubsystems(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-800 pb-8 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Admin
          </h1>
          <p className="text-sm text-zinc-400">
            Manage team members, roles, and invitations.
          </p>
        </div>
        <InviteUserDialog subsystems={subsystems} />
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList variant="line" className="h-auto w-full justify-start gap-6 rounded-none border-b border-zinc-800 bg-transparent p-0">
          <TabsTrigger
            value="members"
            className="rounded-none border-0 bg-transparent px-0 pb-3 text-sm data-active:text-zinc-100 data-active:after:bg-red-600"
          >
            Team Members
            <Badge variant="secondary" className="ml-2">
              {users.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="invitations"
            className="rounded-none border-0 bg-transparent px-0 pb-3 text-sm data-active:text-zinc-100 data-active:after:bg-red-600"
          >
            Pending Invitations
            {invitations.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {invitations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="outline-none">
          <UsersTable
            users={users}
            subsystems={subsystems}
            currentUserId={adminProfile.id}
          />
        </TabsContent>

        <TabsContent value="invitations" className="outline-none">
          <PendingInvitationsTable invitations={invitations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
