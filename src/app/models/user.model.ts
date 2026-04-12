export type UserRole = 'admin' | 'hr' | 'employee' | null;

export interface User {
  id: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: UserRole;
  phone?: string | null;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
