import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../models/user.model';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  const allowedRoles = route.data['roles'] as UserRole[];
  const userRole = authService.userRole();

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  const redirectPath = userRole === 'hr' ? '/app/dashboard' : '/app/dashboard-employee';
  return router.createUrlTree([redirectPath]);
};
