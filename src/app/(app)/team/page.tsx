import { TeamTable } from "@/components/team/TeamTable";

import { getTeamMembers } from "@/lib/team/get-team-members";

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          Team Directory
        </h1>
        <p className="text-sm text-zinc-400">MotoManipal team members.</p>
      </div>

      <TeamTable members={members} />
    </div>
  );
}
