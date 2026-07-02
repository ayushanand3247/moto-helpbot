export type UserRole = "ADMIN" | "BOARD" | "MANAGER" | "MEMBER";

export const ADMIN_ROLE: UserRole = "ADMIN";
export const BOARD_ROLE: UserRole = "BOARD";
export const MANAGER_ROLE: UserRole = "MANAGER";
export const MEMBER_ROLE: UserRole = "MEMBER";

export function normalizeUserRole(role: string | null | undefined): UserRole | null {
  if (!role) return null;
  if (role === "ADMIN" || role === "BOARD" || role === "MANAGER" || role === "MEMBER") {
    return role as UserRole;
  }
  return null;
}

export function isAdmin(role: string | null | undefined): boolean {
  return normalizeUserRole(role) === ADMIN_ROLE;
}

export function isBoard(role: string | null | undefined): boolean {
  return normalizeUserRole(role) === BOARD_ROLE;
}

export function isManager(role: string | null | undefined): boolean {
  return normalizeUserRole(role) === MANAGER_ROLE;
}

export function isMember(role: string | null | undefined): boolean {
  return normalizeUserRole(role) === MEMBER_ROLE;
}

export function canManageUsers(role: string | null | undefined): boolean {
  const r = normalizeUserRole(role);
  return r === ADMIN_ROLE || r === MANAGER_ROLE;
}

export function canManageInvitations(role: string | null | undefined): boolean {
  const r = normalizeUserRole(role);
  return r === ADMIN_ROLE || r === MANAGER_ROLE;
}

export function canBulkImport(role: string | null | undefined): boolean {
  const r = normalizeUserRole(role);
  return r === ADMIN_ROLE || r === MANAGER_ROLE;
}

export function canEditUserDetails(role: string | null | undefined): boolean {
  const r = normalizeUserRole(role);
  return r === ADMIN_ROLE || r === MANAGER_ROLE;
}

export function isBoardOrAbove(role: string | null | undefined): boolean {
  const r = normalizeUserRole(role);
  return r === ADMIN_ROLE || r === BOARD_ROLE;
}

export function isManagerOrAbove(role: string | null | undefined): boolean {
  const r = normalizeUserRole(role);
  return r === ADMIN_ROLE || r === BOARD_ROLE || r === MANAGER_ROLE;
}

export function canManageProjects(role: string | null | undefined): boolean {
  const r = normalizeUserRole(role);
  return r === ADMIN_ROLE || r === BOARD_ROLE || r === MANAGER_ROLE;
}

export function canDeleteProject(role: string | null | undefined): boolean {
  return normalizeUserRole(role) === ADMIN_ROLE;
}

export function canManageTasks(role: string | null | undefined): boolean {
  const r = normalizeUserRole(role);
  return r === ADMIN_ROLE || r === BOARD_ROLE;
}

export function canManageMilestones(role: string | null | undefined): boolean {
  const r = normalizeUserRole(role);
  return r === ADMIN_ROLE || r === BOARD_ROLE;
}

export function canManageSubsystems(role: string | null | undefined): boolean {
  return normalizeUserRole(role) === ADMIN_ROLE;
}

export function canAccessDashboard(role: string | null | undefined): boolean {
  return normalizeUserRole(role) !== null;
}

export function canViewOwnProfile(role: string | null | undefined): boolean {
  return normalizeUserRole(role) !== null;
}

export function canViewAssignedTasks(role: string | null | undefined): boolean {
  return normalizeUserRole(role) !== null;
}
