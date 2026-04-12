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
  {
    path: 'app/dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'app/dashboard-employee',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard-employee/dashboard-employee.component').then(m => m.DashboardEmployeeComponent),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
