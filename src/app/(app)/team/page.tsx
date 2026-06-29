import { TeamTable } from "@/components/team/TeamTable";

import { getTeamMembers } from "@/lib/team/get-team-members";

export default async function TeamPage() {
  const members =
    await getTeamMembers();

  return (
    <div className="space-y-8 moto-animate-in">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Team Directory
        </h1>
        <p className="text-sm text-muted-foreground">
          MotoManipal team members.
        </p>
      </div>

      <TeamTable members={members} />
    </div>
  );
}
