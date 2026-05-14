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
            {
                path: 'auth/reset-password',
                loadComponent: () => import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
            }
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
                    title: 'sidebar.companiesList',
                    subtitle: 'placeholders.companiesSubtitle',
                },
            },
            {
                path: 'users',
                loadComponent: loadPlatformAdminSection,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/users'],
                    title: 'placeholders.platformUsersTitle',
                    subtitle: 'placeholders.platformUsersSubtitle',
                },
            },
            {
                path: 'system-settings',
                loadComponent: loadPlatformAdminSection,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/system-settings'],
                    title: 'sidebar.systemSettings',
                    subtitle: 'placeholders.systemSettingsSubtitle',
                },
            },
            {
                path: 'billing',
                loadComponent: loadPlatformAdminSection,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/billing'],
                    title: 'sidebar.billingLimits',
                    subtitle: 'placeholders.billingSubtitle',
                },
            },
            {
                path: 'system-logs',
                loadComponent: loadPlatformAdminSection,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/system-logs'],
                    title: 'sidebar.systemLogs',
                    subtitle: 'placeholders.systemLogsSubtitle',
                },
            },
            {
                path: 'support-tickets',
                loadComponent: loadPlatformAdminSection,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/support-tickets'],
                    title: 'sidebar.supportTickets',
                    subtitle: 'placeholders.supportTicketsSubtitle',
                },
            },
            {
                path: 'subscription',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/subscription'],
                    title: 'sidebar.subscription',
                    subtitle: 'placeholders.subscriptionSubtitle',
                },
            },
            {
                path: 'reports',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/reports'],
                    title: 'sidebar.reports',
                    subtitle: 'placeholders.reportsSubtitle',
                },
            },
            {
                path: 'onboarding',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/onboarding'],
                    title: 'sidebar.onboarding',
                    subtitle: 'placeholders.onboardingSubtitle',
                },
            },
            {
                path: 'candidates',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/candidates'],
                    title: 'placeholders.candidatesTitle',
                    subtitle: 'placeholders.candidatesSubtitle',
                },
            },
            {
                path: 'absence',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/absence'],
                    title: 'sidebar.absenceVacation',
                    subtitle: 'placeholders.absenceSubtitle',
                },
            },
            {
                path: 'my-team',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/my-team'],
                    title: 'sidebar.myTeam',
                    subtitle: 'placeholders.myTeamSubtitle',
                },
            },
            {
                path: 'team-stats',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/team-stats'],
                    title: 'sidebar.teamStats',
                    subtitle: 'placeholders.teamStatsSubtitle',
                },
            },
            {
                path: 'time-off-requests',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/time-off-requests'],
                    title: 'sidebar.approvals',
                    subtitle: 'placeholders.approvalsSubtitle',
                },
            },
            {
                path: 'tasks-goals',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/tasks-goals'],
                    title: 'sidebar.tasksGoals',
                    subtitle: 'placeholders.tasksGoalsSubtitle',
                },
            },
            {
                path: 'company-info',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/company-info'],
                    title: 'placeholders.companyInfoTitle',
                    subtitle: 'placeholders.companyInfoSubtitle',
                },
            },
            {
                path: 'my-time-off',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/my-time-off'],
                    title: 'placeholders.myTimeOffTitle',
                    subtitle: 'placeholders.myTimeOffSubtitle',
                },
            },
            {
                path: 'learning',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/learning'],
                    title: 'sidebar.knowledgeBase',
                    subtitle: 'placeholders.learningSubtitle',
                },
            },
            {
                path: 'team',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/team'],
                    title: 'sidebar.companyDirectory',
                    subtitle: 'placeholders.teamSubtitle',
                },
            },
            {
                path: 'my-requests',
                loadComponent: loadPlaceholder,
                canActivate: [roleGuard],
                data: {
                    roles: ROUTE_ACCESS['/app/my-requests'],
                    title: 'sidebar.myRequests',
                    subtitle: 'placeholders.myRequestsSubtitle',
                },
            },
        ],
    },
    {
        path: '**',
        loadComponent: () => import('./core/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
    },
];
