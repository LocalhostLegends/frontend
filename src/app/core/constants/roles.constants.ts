/** Role model and helpers — overview: `docs/roles.md`. */
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'hr' | 'employee';
const KNOWN_ROLES: UserRole[] = ['super_admin', 'admin', 'manager', 'hr', 'employee'];
export const DEFAULT_USER_ROLE: UserRole = 'employee';
export const REGISTRATION_ROLES: UserRole[] = ['admin', 'hr', DEFAULT_USER_ROLE];
export const ORGANIZATION_MEMBER_ROLES: UserRole[] = ['admin', 'hr', 'manager', DEFAULT_USER_ROLE];
export function normalizeUserRole(value: string | null | undefined): UserRole {
  if (value == null || typeof value !== 'string') {
    return DEFAULT_USER_ROLE;
  }
  const raw = value.trim().toLowerCase().replace(/-/g, '_');
  const synonyms: Record<string, UserRole> = {
    superadmin: 'super_admin',
    administrator: 'admin',
    hr_manager: 'hr',
    human_resources: 'hr',
    user: 'employee',
    staff: 'employee',
  };
  if (synonyms[raw]) {
    return synonyms[raw];
  }
  if (KNOWN_ROLES.includes(raw as UserRole)) {
    return raw as UserRole;
  }
  return DEFAULT_USER_ROLE;
}
export function normalizeRouteRoles(value: unknown): UserRole[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is UserRole => typeof item === 'string' && KNOWN_ROLES.includes(item as UserRole),
  );
}
export interface RoleConfig {
  value: UserRole;
  label: string;
  description: string;
  level: number;
}
export const ROLES_CONFIG: Record<UserRole, RoleConfig> = {
  super_admin: {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Developer access - manage all companies and system settings',
    level: 5,
  },
  admin: {
    value: 'admin',
    label: 'Administrator',
    description: 'Company owner - full access to company',
    level: 4,
  },
  manager: {
    value: 'manager',
    label: 'Manager',
    description: 'Department head - manages department and employees',
    level: 2,
  },
  hr: {
    value: 'hr',
    label: 'HR Manager',
    description: 'HR Manager - manages employees and invites',
    level: 3,
  },
  employee: {
    value: 'employee',
    label: 'Employee',
    description: 'Basic employee - view own profile and limited info',
    level: 1,
  },
};
export function getRoleConfig(role: UserRole): RoleConfig {
  return ROLES_CONFIG[role];
}
export function getRoleLabel(role: string | null | undefined): string {
  if (!role) return 'User';
  const normalizedRole = normalizeUserRole(role);
  return ROLES_CONFIG[normalizedRole]?.label || 'User';
}
export function getAllRoles(): UserRole[] {
  return Object.keys(ROLES_CONFIG) as UserRole[];
}
export function getRegistrationRoles(): UserRole[] {
  return [...REGISTRATION_ROLES];
}
export function getOrganizationMemberRoles(): UserRole[] {
  return [...ORGANIZATION_MEMBER_ROLES];
}
export function getInvitableRoles(requesterRole: UserRole | null): UserRole[] {
  if (!requesterRole) return [];
  switch (requesterRole) {
    case 'super_admin':
      return getAllRoles();
    case 'admin':
      return ['hr'];
    case 'hr':
      return ['hr', 'manager', DEFAULT_USER_ROLE];
    case 'manager':
    case 'employee':
      return [];
    default:
      return [];
  }
}
export function getDefaultInviteRole(requesterRole: UserRole | null): UserRole | null {
  if (!requesterRole) return null;
  switch (requesterRole) {
    case 'super_admin':
      return 'admin';
    case 'admin':
      return 'hr';
    case 'hr':
      return DEFAULT_USER_ROLE;
    case 'manager':
    case 'employee':
      return null;
    default:
      return null;
  }
}
export function isAdminRole(role: UserRole | null): boolean {
  return role === 'admin';
}
export function canSendInvites(role: UserRole | null): boolean {
  return role === 'admin' || role === 'hr';
}
export function canHrModifyUser(viewer: UserRole | null, targetRole: UserRole): boolean {
  if (viewer !== 'hr') return true;
  return targetRole !== 'admin';
}
export function canManageRole(managerRole: UserRole | null, targetRole: UserRole): boolean {
  if (!managerRole) return false;
  const invitable = getInvitableRoles(managerRole);
  return invitable.includes(targetRole);
}
export function hasRoleAccess(role: UserRole | null, requiredRoles: UserRole[]): boolean {
  if (!role) return false;
  return requiredRoles.includes(role);
}
export function canSeeOrganizationData(role: UserRole | null): boolean {
  return hasRoleAccess(role, ['admin', 'hr']);
}
export function canManageDepartments(role: UserRole | null): boolean {
  return hasRoleAccess(role, ['hr']);
}
export function canViewDepartments(role: UserRole | null): boolean {
  return hasRoleAccess(role, ['admin', 'hr']);
}
export function isHrRole(role: UserRole | null): boolean {
  return role === 'hr';
}
export function isEmployeeRole(role: UserRole | null): boolean {
  return role === DEFAULT_USER_ROLE;
}
export function isManagerRole(role: UserRole | null): boolean {
  return role === 'manager';
}
