export type UserRole = 'admin' | 'hr' | 'employee';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  companyId?: string;
  companyName?: string;
  createdAt?: string;
  updatedAt?: string;
}
