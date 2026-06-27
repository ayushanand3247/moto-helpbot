"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminInvitation } from "@/lib/admin/types";
import { Copy, Check, Clock, Calendar } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

type PendingInvitationsTableProps = {
  invitations: AdminInvitation[];
};

export function PendingInvitationsTable({ invitations }: PendingInvitationsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = (id: string, token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return (
      <Badge variant="outline" className="border-zinc-700 bg-zinc-900/60 text-zinc-400">
        <Clock className="size-3" />
        Active
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="border-b border-zinc-800">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">
            Pending Invitations
          </CardTitle>
          <CardDescription>
            Team members who have been invited but haven&apos;t completed registration.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <Clock className="mb-3 size-8 text-zinc-600" />
            <p className="text-sm text-zinc-400">No pending invitations</p>
            <p className="mt-1 text-xs text-zinc-500">
              Invite a team member to see them here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Invitee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Subsystem</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => {
                  const isExpired = new Date(invitation.expires_at) < new Date();
                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <span className="text-sm text-zinc-200">{invitation.full_name}</span>
                          <span className="text-xs text-zinc-500">{invitation.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{invitation.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {invitation.subsystem ? (
                          <span className="text-sm text-zinc-300">{invitation.subsystem.name}</span>
                        ) : (
                          <span className="text-sm text-zinc-500">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-zinc-400">{invitation.position || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Calendar className="size-3.5" />
                          {isExpired
                            ? format(new Date(invitation.expires_at), "MMM d, yyyy")
                            : formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(invitation.expires_at)}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyLink(invitation.id, invitation.token)}
                          disabled={isExpired}
                        >
                          {copiedId === invitation.id ? (
                            <>
                              <Check className="size-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" />
                              Copy
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
