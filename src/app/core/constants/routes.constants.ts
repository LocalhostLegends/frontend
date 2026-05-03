import { UserRole } from './roles.constants';
export const ROUTE_ACCESS: Record<string, UserRole[]> = {
    '/app/dashboard': ['super_admin', 'admin', 'manager', 'hr', 'employee'],
    '/app/profile': ['super_admin', 'admin', 'manager', 'hr', 'employee'],
    '/app/invites': ['admin', 'hr'],
    '/app/departments': ['admin', 'hr'],
    '/app/employees': ['admin', 'hr'],
    '/app/settings': ['admin'],
    '/app/companies': ['super_admin'],
    '/app/users': ['super_admin'],
    '/app/system-settings': ['super_admin'],
    '/app/billing': ['super_admin'],
    '/app/system-logs': ['super_admin'],
    '/app/support-tickets': ['super_admin'],
    '/app/subscription': ['admin'],
    '/app/reports': ['admin'],
    '/app/onboarding': ['admin', 'hr'],
    '/app/candidates': ['admin', 'hr'],
    '/app/absence': ['hr'],
    '/app/my-team': ['manager'],
    '/app/team-stats': ['manager'],
    '/app/time-off-requests': ['hr', 'manager'],
    '/app/tasks-goals': ['manager'],
    '/app/company-info': ['super_admin', 'admin', 'manager', 'hr', 'employee'],
    '/app/my-time-off': ['super_admin', 'admin', 'manager', 'hr', 'employee'],
    '/app/learning': ['super_admin', 'admin', 'manager', 'hr', 'employee'],
    '/app/team': ['super_admin', 'admin', 'manager', 'hr', 'employee'],
    '/app/my-requests': ['super_admin', 'admin', 'manager', 'hr', 'employee'],
};
export function getRouteRoles(route: string): UserRole[] {
    return ROUTE_ACCESS[route] || [];
}
export function canAccessRoute(role: UserRole, route: string): boolean {
    const allowedRoles = getRouteRoles(route);
    return allowedRoles.includes(role);
}
