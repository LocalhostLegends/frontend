import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // 1. Landing (public)
  {
    path: 'auth',
    loadComponent: () =>
      import('./core/layouts/landing-layout/landing-layout.component').then(
        (m) => m.LandingLayoutComponent,
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // Invite acceptance (public)
  {
    path: 'invite',
    children: [
      {
        path: 'accept',
        loadComponent: () =>
          import('./features/invites/invite-accept.component').then((m) => m.InviteAcceptComponent),
      },
    ],
  },

  // 2. App (private)
  {
    path: 'app',
    loadComponent: () =>
      import('./core/layouts/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'dashboard-employee',
        loadComponent: () =>
          import('./features/dashboard/dashboard-employee/dashboard-employee.component').then(
            (m) => m.DashboardEmployeeComponent,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'profile-employee',
        loadComponent: () =>
          import('./features/profile/profile-employee/profile-employee.component').then(
            (m) => m.ProfileEmployeeComponent,
          ),
      },
      {
        path: 'invites',
        loadComponent: () =>
          import('./features/invites/invite-management.component').then(
            (m) => m.InviteManagementComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
      },
    ],
  },

  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
