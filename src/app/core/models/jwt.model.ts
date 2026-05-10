import { UserRole } from '@app/core/constants/roles.constants';
export interface JwtPayload {
  sub: string;
  email: string;
  role?: UserRole | null;
  roles?: UserRole[];
  iat: number;
  exp: number;
}
