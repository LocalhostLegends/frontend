import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { normalizeRouteRoles, UserRole } from '@app/core/constants/roles.constants';
export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }
  const allowedRoles = normalizeRouteRoles(route.data['roles']);
  const userRole = authService.userRole();
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }
  return router.createUrlTree(['/app/dashboard']);
};
