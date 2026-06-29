import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminUsers, getAdminProjects, getAdminSubsystems, getAdminInvitations, getAnalytics, getAuditLogs } from "@/lib/admin/get-admin-data";
import { AdminClient } from "@/components/admin/AdminClient";

export default async function AdminPage() {
  await requireAdmin();

  const [users, projects, subsystems, invitations, analytics, auditLogs] =
    await Promise.all([
      getAdminUsers(),
      getAdminProjects(),
      getAdminSubsystems(),
      getAdminInvitations(),
      getAnalytics(),
      getAuditLogs(100),
    ]);

  return (
    <AdminClient
      users={users}
      projects={projects}
      subsystems={subsystems}
      invitations={invitations}
      analytics={analytics}
      auditLogs={auditLogs}
    />
  );
}
