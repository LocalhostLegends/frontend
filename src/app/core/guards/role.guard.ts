import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { normalizeRouteRoles, UserRole } from '@app/core/constants/roles.constants';
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = normalizeRouteRoles(route.data['roles']);
  const userRole = authService.userRole();
  if (authService.isAuthenticated() && userRole && expectedRoles?.includes(userRole)) {
    return true;
  }
  return router.createUrlTree(['/app/dashboard']);
};
