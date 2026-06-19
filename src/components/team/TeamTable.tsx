import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <div className="rounded-lg border p-8 text-center">
        No team members found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Subsystem</TableHead>
            <TableHead>Position</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                {member.full_name}
              </TableCell>

              <TableCell>
                {member.role}
              </TableCell>

              <TableCell>
                {member.subsystems?.[0]?.name ??
  "Unassigned"}
              </TableCell>

              <TableCell>
                {member.position ??
                  "Not Set"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}