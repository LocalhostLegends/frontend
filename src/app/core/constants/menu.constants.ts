import { UserRole } from './roles.constants';
export interface MenuItem {
    labelKey: string;
    icon: string;
    route: string;
    exact: boolean;
}
export const MENU_BY_ROLE: Record<UserRole, MenuItem[]> = {
    super_admin: [
        { labelKey: 'sidebar.dashboard', icon: 'dashboard.svg', route: '/app/dashboard', exact: true },
        { labelKey: 'sidebar.companiesList', icon: 'people.svg', route: '/app/companies', exact: false },
        { labelKey: 'sidebar.billingLimits', icon: 'settings.svg', route: '/app/billing', exact: false },
        { labelKey: 'sidebar.systemLogs', icon: 'folder.svg', route: '/app/system-logs', exact: false },
        { labelKey: 'sidebar.supportTickets', icon: 'people.svg', route: '/app/support-tickets', exact: false },
        { labelKey: 'sidebar.users', icon: 'people.svg', route: '/app/users', exact: false },
        { labelKey: 'sidebar.systemSettings', icon: 'settings.svg', route: '/app/system-settings', exact: false },
    ],
    admin: [
        { labelKey: 'sidebar.dashboard', icon: 'dashboard.svg', route: '/app/dashboard', exact: true },
        { labelKey: 'sidebar.departments', icon: 'folder.svg', route: '/app/departments', exact: false },
        { labelKey: 'sidebar.users', icon: 'people.svg', route: '/app/employees', exact: false },
        { labelKey: 'sidebar.companySettings', icon: 'settings.svg', route: '/app/settings', exact: false },
        { labelKey: 'sidebar.subscription', icon: 'analytics.svg', route: '/app/subscription', exact: false },
        { labelKey: 'sidebar.reports', icon: 'recruitment.svg', route: '/app/reports', exact: false },
    ],
    hr: [
        { labelKey: 'sidebar.dashboard', icon: 'dashboard.svg', route: '/app/dashboard', exact: true },
        { labelKey: 'sidebar.staffManagement', icon: 'people.svg', route: '/app/employees', exact: false },
        { labelKey: 'sidebar.invites', icon: 'people.svg', route: '/app/invites', exact: false },
        { labelKey: 'sidebar.orgStructure', icon: 'folder.svg', route: '/app/departments', exact: false },
        { labelKey: 'sidebar.onboarding', icon: 'recruitment.svg', route: '/app/onboarding', exact: false },
        { labelKey: 'sidebar.absenceVacation', icon: 'analytics.svg', route: '/app/absence', exact: false },
    ],
    manager: [
        { labelKey: 'sidebar.dashboard', icon: 'dashboard.svg', route: '/app/dashboard', exact: true },
        { labelKey: 'sidebar.myTeam', icon: 'people.svg', route: '/app/my-team', exact: false },
        { labelKey: 'sidebar.teamStats', icon: 'analytics.svg', route: '/app/team-stats', exact: false },
        { labelKey: 'sidebar.approvals', icon: 'analytics.svg', route: '/app/time-off-requests', exact: false },
        { labelKey: 'sidebar.tasksGoals', icon: 'recruitment.svg', route: '/app/tasks-goals', exact: false },
    ],
    employee: [
        { labelKey: 'sidebar.dashboard', icon: 'dashboard.svg', route: '/app/dashboard', exact: true },
        { labelKey: 'sidebar.companyDirectory', icon: 'people.svg', route: '/app/team', exact: false },
        { labelKey: 'sidebar.myRequests', icon: 'analytics.svg', route: '/app/my-requests', exact: false },
        { labelKey: 'sidebar.knowledgeBase', icon: 'folder.svg', route: '/app/learning', exact: false },
    ],
};
export function getMenuItemsByRole(role: UserRole | null): MenuItem[] {
    if (!role)
        return [];
    return MENU_BY_ROLE[role] || [];
}
