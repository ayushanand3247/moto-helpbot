import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
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

export function TeamTable({ members }: Props) {
  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-sm text-zinc-500">
          No team members found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subsystem</TableHead>
              <TableHead className="pr-6">Position</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="pl-6 text-sm text-zinc-200">
                  {member.full_name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{member.role}</Badge>
                </TableCell>
                <TableCell className="text-sm text-zinc-400">
                  {member.subsystems?.[0]?.name ?? "Unassigned"}
                </TableCell>
                <TableCell className="pr-6 text-sm text-zinc-400">
                  {member.position ?? "Not Set"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
