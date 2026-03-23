export type UserRole = 'admin' | 'hr' | 'employee' | null;

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: UserRole;
}