import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LandingLayoutComponent } from './features/landing/layouts/landing-layout/landing-layout.component';
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
        path: 'activate',
        loadComponent: () =>
          import('./features/auth/activate-account/activate-account.component').then(
            (m) => m.ActivateAccountComponent,
          ),
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
          import('./features/dashboard/containers/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'invites',
        loadComponent: () =>
          import('./features/invites/invite-management.component').then(
            (m) => m.InviteManagementComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'hr'] },
      },
    ],
  },

  {
    path: '**',
    loadComponent: () =>
      import('./core/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
