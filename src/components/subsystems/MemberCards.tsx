import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SubsystemMember } from "@/lib/subsystems/types";

type Props = {
  members: SubsystemMember[];
  subsystemColor: string | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const roleColors: Record<string, string> = {
  ADMIN: "border-red-500/30 bg-red-500/5 text-red-400",
  BOARD: "border-amber-500/30 bg-amber-500/5 text-amber-400",
  MEMBER: "border-zinc-700 bg-zinc-900/60 text-zinc-400",
};

export function MemberCards({ members }: Props) {
  if (members.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        No active members in this subsystem.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {members.map((member) => (
        <Card key={member.id}>
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <Avatar className="size-9 shrink-0 border border-zinc-800">
                <AvatarFallback className="bg-zinc-800 text-xs text-zinc-300">
                  {getInitials(member.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-200">
                  {member.full_name}
                </p>
                {member.position && (
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {member.position}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${roleColors[member.role] ?? ""}`}
                  >
                    {member.role}
                  </Badge>
                  <span className="text-[11px] text-zinc-500">
                    {member.assignedTaskCount} active
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
