import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';
import { LandingLayoutComponent } from './features/landing/layouts/landing-layout/landing-layout.component';
import { AppLayoutComponent } from './core/layouts/app-layout/app-layout.component';
import { ROUTE_ACCESS } from './core/constants/routes.constants';
const loadPlaceholder = () => import('./core/pages/section-placeholder/section-placeholder.component').then((m) => m.SectionPlaceholderComponent);
const loadPlatformAdminSection = () =>
    import('./features/platform-admin/pages/admin-section/admin-section.component').then((m) => m.PlatformAdminSectionComponent);
export const routes: Routes = [
    {
        path: '',
        component: LandingLayoutComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                loadComponent: () => import('./features/landing/pages/home/home.component').then((m) => m.HomeComponent),
            },
            {
                path: 'auth/login',
                loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
            },
            {
                path: 'auth/register',
                loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
            },
            {
                path: 'activate',
                loadComponent: () => import('./features/auth/activate-account/activate-account.component').then((m) => m.ActivateAccountComponent),
            },
            {
                path: 'auth/activate',
                loadComponent: () => import('./features/auth/activate-account/activate-account.component').then((m) => m.ActivateAccountComponent),
            },
            {
                path: 'invite-accept',
                loadComponent: () => import('./features/auth/activate-account/activate-account.component').then((m) => m.ActivateAccountComponent),
            },
            {
                path: 'auth/forgot-password',
                loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
            },
        ],
    },
    {
        path: 'app',
        component: AppLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/containers/dashboard.component').then((m) => m.DashboardComponent),
                canActivate: [roleGuard],
                data: { roles: ROUTE_ACCESS['/app/dashboard'] },
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile/profile.component').then((m) => m.ProfileComponent),
                canActivate: [roleGuard],
                canDeactivate: [pendingChangesGuard],
                data: { roles: ROUTE_ACCESS['/app/profile'] },
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent),
                canActivate: [roleGuard],
                data: { roles: ROUTE_ACCESS['/app/settings'] },
            },
            {
                path: 'invites',
                loadComponent: () => import('./features/invites/invite-management.component').then((m) => m.InviteManagementComponent),
                canActivate: [roleGuard],
                data: { roles: ROUTE_ACCESS['/app/invites'] },
            },
            {
                path: 'departments',
                loadComponent: () => import('./features/departments/departments.component').then((m) => m.DepartmentsComponent),
                canActivate: [roleGuard],
                data: { roles: ROUTE_ACCESS['/app/departments'] },
            },
            {
                path: 'employees',
                loadComponent: () => import('./features/employees/employees.component').then((m) => m.EmployeesComponent),
                canActivate: [roleGuard],
                data: { roles: ROUTE_ACCESS['/app/employees'] },
            },
            {
                path: 'companies',
                loadComponent: loadPlatformAdminSection,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/companies'],
                    title: 'Companies List',
                    subtitle: 'All client companies, limits, and support access.',
                },
            },
            {
                path: 'users',
                loadComponent: loadPlatformAdminSection,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/users'],
                    title: 'Platform Users',
                    subtitle: 'Cross-tenant user administration.',
                },
            },
            {
                path: 'system-settings',
                loadComponent: loadPlatformAdminSection,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/system-settings'],
                    title: 'System Settings',
                    subtitle: 'Global platform configuration.',
                },
            },
            {
                path: 'billing',
                loadComponent: loadPlatformAdminSection,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/billing'],
                    title: 'Billing & Limits',
                    subtitle: 'Plans, seat limits, and API keys.',
                },
            },
            {
                path: 'system-logs',
                loadComponent: loadPlatformAdminSection,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/system-logs'],
                    title: 'System Logs',
                    subtitle: 'Errors and audit trail.',
                },
            },
            {
                path: 'support-tickets',
                loadComponent: loadPlatformAdminSection,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/support-tickets'],
                    title: 'Support Tickets',
                    subtitle: 'Tickets from company admins.',
                },
            },
            {
                path: 'subscription',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/subscription'],
                    title: 'Subscription',
                    subtitle: 'Current plan and billing.',
                },
            },
            {
                path: 'reports',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/reports'],
                    title: 'Reports',
                    subtitle: 'Export and analytics for your company.',
                },
            },
            {
                path: 'onboarding',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/onboarding'],
                    title: 'Onboarding',
                    subtitle: 'New hire status and tasks.',
                },
            },
            {
                path: 'candidates',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/candidates'],
                    title: 'Candidates',
                    subtitle: 'Recruitment pipeline.',
                },
            },
            {
                path: 'absence',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/absence'],
                    title: 'Absence / Vacation',
                    subtitle: 'Leave calendar and absence overview.',
                },
            },
            {
                path: 'my-team',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/my-team'],
                    title: 'My Team',
                    subtitle: 'People in your department.',
                },
            },
            {
                path: 'team-stats',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/team-stats'],
                    title: 'Team Stats',
                    subtitle: 'KPIs for your direct reports.',
                },
            },
            {
                path: 'time-off-requests',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/time-off-requests'],
                    title: 'Approvals',
                    subtitle: 'Leave and time-off requests from your team.',
                },
            },
            {
                path: 'tasks-goals',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/tasks-goals'],
                    title: 'Tasks / Goals',
                    subtitle: 'Team objectives (when enabled).',
                },
            },
            {
                path: 'company-info',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/company-info'],
                    title: 'Company Info',
                    subtitle: 'About your organization.',
                },
            },
            {
                path: 'my-time-off',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/my-time-off'],
                    title: 'My Time Off',
                    subtitle: 'Your leave balance and requests.',
                },
            },
            {
                path: 'learning',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/learning'],
                    title: 'Knowledge Base',
                    subtitle: 'Policies and internal resources.',
                },
            },
            {
                path: 'team',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/team'],
                    title: 'Company Directory',
                    subtitle: 'Colleague directory (read-only).',
                },
            },
            {
                path: 'my-requests',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/my-requests'],
                    title: 'My Requests',
                    subtitle: 'Vacation, certificates, and HR requests.',
                },
            },
        ],
    },
    {
        path: '**',
        loadComponent: () => import('./core/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
    },
];
