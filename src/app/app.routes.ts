import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
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
    path: 'app/dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'app/dashboard-employee',
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