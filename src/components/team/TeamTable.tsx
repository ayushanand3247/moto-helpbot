import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Member = {
  id: string;
  full_name: string;
  role: string;
  position: string | null;
  is_active: boolean | null;
  subsystems:
  | {
      name: string;
    }[]
  | null;
};

type Props = {
  members: Member[];
};

const roleVariant: Record<string, "default" | "warning" | "secondary"> = {
  ADMIN: "default",
  TEAM_MANAGER: "warning",
  CAPTAIN: "warning",
  SUBSYSTEM_LEAD: "warning",
  MEMBER: "secondary",
};

const roleDisplay: Record<string, string> = {
  ADMIN: "Admin",
  TEAM_MANAGER: "Team Manager",
  CAPTAIN: "Captain",
  SUBSYSTEM_LEAD: "Subsystem Lead",
  MEMBER: "Member",
};

export function TeamTable({ members }: Props) {
  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/40 p-12 text-center">
        <p className="text-xs text-muted-foreground/70">No team members found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/40 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Subsystem</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium text-foreground">
                {member.full_name}
              </TableCell>

              <TableCell>
                <Badge variant={roleVariant[member.role] ?? "secondary"}>
                  {roleDisplay[member.role] ?? member.role}
                </Badge>
              </TableCell>

              <TableCell className="text-muted-foreground/70">
                {member.subsystems?.[0]?.name ?? "Unassigned"}
              </TableCell>

              <TableCell className="text-muted-foreground/70">
                {member.position ?? "Not Set"}
              </TableCell>

              <TableCell>
                <Badge variant={member.is_active !== false ? "success" : "outline"}>
                  {member.is_active !== false ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
