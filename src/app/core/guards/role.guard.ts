import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../models/user.model';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as UserRole[];
  const userRole = authService.userRole();

  if (authService.isAuthenticated() && userRole && expectedRoles.includes(userRole)) {
    return true;
  }

  
  return router.parseUrl('/');
};
