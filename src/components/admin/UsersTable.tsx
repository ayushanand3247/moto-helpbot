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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminUser, UserRole } from "@/lib/admin/types";
import { updateUserRole } from "@/actions/admin/update-user-role";
import { updateUserSubsystem } from "@/actions/admin/update-user-subsystem";
import { toggleUserStatus } from "@/actions/admin/toggle-user-status";
import { Loader2, Shield, UserX, UserCheck, Users } from "lucide-react";

type UsersTableProps = {
  users: AdminUser[];
  subsystems: { id: string; name: string }[];
  currentUserId?: string; // Optional: to prevent self-deactivation or self-demotion if needed
};

export function UsersTable({ users, subsystems, currentUserId }: UsersTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setUpdatingId(userId);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("role", role);
      const res = await updateUserRole(null, formData);
      if (res?.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSubsystemChange = async (userId: string, subsystemId: string) => {
    setUpdatingId(userId);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("subsystemId", subsystemId);
      const res = await updateUserSubsystem(null, formData);
      if (res?.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update subsystem.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(userId);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("isActive", (!currentStatus).toString());
      const res = await toggleUserStatus(null, formData);
      if (res?.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update user status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-zinc-800">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">Team Members</CardTitle>
          <CardDescription>
            Manage user roles, subsystem assignments, and account statuses.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {error && (
          <div className="m-4 rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <Users className="mb-3 size-8 text-zinc-600" />
            <p className="text-sm text-zinc-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Subsystem</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isUpdating = updatingId === user.id;

                  return (
                    <TableRow
                      key={user.id}
                      className={!user.is_active ? "opacity-60" : ""}
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 border border-zinc-800">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-zinc-800 text-xs text-zinc-300">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 text-sm text-zinc-200">
                              {user.full_name}
                              {isSelf && (
                                <Badge variant="secondary" className="text-[10px]">
                                  You
                                </Badge>
                              )}
                            </span>
                            <span className="text-xs text-zinc-500">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(val) => handleRoleChange(user.id, val as UserRole)}
                          disabled={isSelf || isUpdating || !user.is_active}
                        >
                          <SelectTrigger className="h-8 w-[120px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">MEMBER</SelectItem>
                            <SelectItem value="BOARD">BOARD</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.subsystem?.id || "none"}
                          onValueChange={(val) => handleSubsystemChange(user.id, val)}
                          disabled={isUpdating || !user.is_active}
                        >
                          <SelectTrigger className="h-8 w-[160px] text-xs">
                            <SelectValue placeholder="No Subsystem" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Subsystem</SelectItem>
                            {subsystems.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-zinc-400">{user.position || "—"}</span>
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Deactivated</Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isUpdating && <Loader2 className="size-4 animate-spin text-zinc-500" />}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={
                              user.is_active
                                ? "text-red-400 hover:bg-red-500/5 hover:text-red-400"
                                : "text-zinc-400 hover:text-zinc-200"
                            }
                            onClick={() => handleToggleStatus(user.id, user.is_active)}
                            disabled={isSelf || isUpdating}
                          >
                            {user.is_active ? (
                              <>
                                <UserX className="size-3.5" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="size-3.5" />
                                Reactivate
                              </>
                            )}
                          </Button>
                        </div>
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
