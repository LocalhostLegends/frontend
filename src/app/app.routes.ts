import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard'; 

export const routes: Routes = [
  // 1. Auth Group (public)
{
  path: 'auth',
  loadComponent: () => 
    import('./core/layouts/landing-layout/landing-layout.component').then(m => m.AuthLayoutComponent),
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

  // 2. App Group (Protected part)
  {
    path: 'app',
    loadComponent: () => import('./core/layouts/app-layout/app-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard], 
    children: [
      
      /* {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      */
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];