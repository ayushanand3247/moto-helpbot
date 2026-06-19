import { TeamTable } from "@/components/team/TeamTable";

import { getTeamMembers } from "@/lib/team/get-team-members";

export default async function TeamPage() {
  const members =
    await getTeamMembers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Team Directory
        </h1>

        <p className="text-muted-foreground">
          MotoManipal team members.
        </p>
      </div>

      <TeamTable members={members} />
    </div>
  );
}