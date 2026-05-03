import { UserRole } from '@app/core/constants/roles.constants';
export interface UserCompany {
    id: string;
    name: string;
    subdomain?: string | null;
    logoUrl?: string | null;
    timezone?: string;
    isActive?: boolean;
    subscriptionPlan?: string;
    subscriptionExpiresAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}
export interface UserDepartment {
    id?: string;
    name?: string;
}
export interface UserPosition {
    id?: string;
    name?: string;
}
export interface User {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    status?: string;
    phone?: string | null;
    avatar?: string;
    companyId?: string;
    companyName?: string;
    company?: UserCompany | null;
    department?: UserDepartment | null;
    position?: UserPosition | null;
    lastLoginAt?: string;
    dateOfBirth?: string | null;
    vacationDaysRemaining?: number | null;
    createdAt?: string;
    updatedAt?: string;
}
