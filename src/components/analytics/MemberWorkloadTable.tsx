import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MemberWorkload } from "@/lib/analytics/types";

type Props = {
  members: MemberWorkload[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MemberWorkloadTable({ members }: Props) {
  return (
    <Card>
      <CardHeader className="border-b border-zinc-800">
        <CardTitle className="text-base font-semibold tracking-tight">
          Member Workload
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {members.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">
            No active members with tasks.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Member</TableHead>
                  <TableHead className="text-center">Assigned</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">Overdue</TableHead>
                  <TableHead className="pr-6 text-center">Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-7 border border-zinc-800">
                          <AvatarFallback className="bg-zinc-800 text-[10px] font-medium text-zinc-300">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-zinc-200">
                          {member.full_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm text-zinc-300">
                      {member.assigned}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm text-zinc-300">
                      {member.completed}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={
                          member.overdue > 0
                            ? "font-mono text-sm text-red-400"
                            : "font-mono text-sm text-zinc-500"
                        }
                      >
                        {member.overdue}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-zinc-400 transition-all"
                            style={{ width: `${member.completionRate}%` }}
                          />
                        </div>
                        <span className="w-10 text-right font-mono text-xs text-zinc-400">
                          {member.completionRate}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
