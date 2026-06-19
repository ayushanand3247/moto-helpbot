import { requireAdmin } from "@/lib/auth/require-admin";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Admin
        </h1>

        <p className="text-muted-foreground">
          Administrative tools and system management.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              User Management
            </CardTitle>
          </CardHeader>

          <CardContent>
            Manage team members and roles.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Invitations
            </CardTitle>
          </CardHeader>

          <CardContent>
            Create and track invitations.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Projects
            </CardTitle>
          </CardHeader>

          <CardContent>
            Manage project lifecycle.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              System
            </CardTitle>
          </CardHeader>

          <CardContent>
            System administration tools.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}