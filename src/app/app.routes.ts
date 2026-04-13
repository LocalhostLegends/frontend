import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LandingLayoutComponent } from './core/layouts/landing-layout/landing-layout.component';
import { AppLayoutComponent } from './core/layouts/app-layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  // Public routes with landing layout (including header)
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      {
        path: 'auth/login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'auth/register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'invite/accept',
        loadComponent: () =>
          import('./features/invites/invite-accept.component').then((m) => m.InviteAcceptComponent),
      },
    ],
  },

  // Protected routes with app layout
  {
    path: 'app',
    component: AppLayoutComponent,
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

  {
    path: '**',
    loadComponent: () =>
      import('./shared/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
