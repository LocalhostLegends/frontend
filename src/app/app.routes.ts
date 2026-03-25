import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard'; 

export const routes: Routes = [
  // 1. Landing (public)
{
  path: 'auth',
  loadComponent: () => 
    import('./core/layouts/landing-layout/landing-layout.component').then(m => m.LandingLayoutComponent),
  children: [
    {
      path: 'login',
      loadComponent: () => 
        import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
      path: 'register',
      loadComponent: () => 
        import('./features/auth/register/register.component').then(m => m.RegisterComponent)
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
  ]
},

  // 2. App (private)
 {
    path: 'app',
    loadComponent: () => 
      import('./core/layouts/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [authGuard], 
    children: [
      {
        path: 'dashboard',
        loadComponent: () => 
          import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'dashboard-employee',
        loadComponent: () => 
          import('./features/dashboard/dashboard-employee/dashboard-employee.component').then(m => m.DashboardEmployeeComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];