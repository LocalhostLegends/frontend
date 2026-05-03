import { UserRole } from './roles.constants';
export interface MenuItem {
    label: string;
    icon: string;
    route: string;
    exact: boolean;
}
export const MENU_BY_ROLE: Record<UserRole, MenuItem[]> = {
    super_admin: [
        { label: 'Dashboard', icon: 'dashboard.svg', route: '/app/dashboard', exact: true },
        { label: 'Companies List', icon: 'people.svg', route: '/app/companies', exact: false },
        { label: 'Billing & Limits', icon: 'settings.svg', route: '/app/billing', exact: false },
        { label: 'System Logs', icon: 'folder.svg', route: '/app/system-logs', exact: false },
        { label: 'Support Tickets', icon: 'people.svg', route: '/app/support-tickets', exact: false },
        { label: 'Users', icon: 'people.svg', route: '/app/users', exact: false },
        { label: 'System Settings', icon: 'settings.svg', route: '/app/system-settings', exact: false },
    ],
    admin: [
        { label: 'Dashboard', icon: 'dashboard.svg', route: '/app/dashboard', exact: true },
        { label: 'Departments', icon: 'folder.svg', route: '/app/departments', exact: false },
        { label: 'Users', icon: 'people.svg', route: '/app/employees', exact: false },
        { label: 'Company Settings', icon: 'settings.svg', route: '/app/settings', exact: false },
        { label: 'Subscription', icon: 'analytics.svg', route: '/app/subscription', exact: false },
        { label: 'Reports', icon: 'recruitment.svg', route: '/app/reports', exact: false },
    ],
    hr: [
        { label: 'Dashboard', icon: 'dashboard.svg', route: '/app/dashboard', exact: true },
        { label: 'Staff Management', icon: 'people.svg', route: '/app/employees', exact: false },
        { label: 'Invites', icon: 'people.svg', route: '/app/invites', exact: false },
        { label: 'Org Structure', icon: 'folder.svg', route: '/app/departments', exact: false },
        { label: 'Onboarding', icon: 'recruitment.svg', route: '/app/onboarding', exact: false },
        { label: 'Absence / Vacation', icon: 'analytics.svg', route: '/app/absence', exact: false },
    ],
    manager: [
        { label: 'Dashboard', icon: 'dashboard.svg', route: '/app/dashboard', exact: true },
        { label: 'My Team', icon: 'people.svg', route: '/app/my-team', exact: false },
        { label: 'Team Stats', icon: 'analytics.svg', route: '/app/team-stats', exact: false },
        { label: 'Approvals', icon: 'analytics.svg', route: '/app/time-off-requests', exact: false },
        { label: 'Tasks / Goals', icon: 'recruitment.svg', route: '/app/tasks-goals', exact: false },
    ],
    employee: [
        { label: 'Dashboard', icon: 'dashboard.svg', route: '/app/dashboard', exact: true },
        { label: 'Company Directory', icon: 'people.svg', route: '/app/team', exact: false },
        { label: 'My Requests', icon: 'analytics.svg', route: '/app/my-requests', exact: false },
        { label: 'Knowledge Base', icon: 'folder.svg', route: '/app/learning', exact: false },
    ],
};
export function getMenuItemsByRole(role: UserRole | null): MenuItem[] {
    if (!role)
        return [];
    return MENU_BY_ROLE[role] || [];
}
