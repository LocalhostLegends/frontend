export interface Invite {
    id: string;
    email: string;
    token: string;
    status: string;
    role: string;
    companyId: string;
    invitedById: string;
    departmentId?: string | null;
    positionId?: string | null;
    expiresAt: string;
    createdAt?: string;
    acceptedAt?: string | null;
}
export interface CreateInviteRequest {
    email: string;
    role: string;
    departmentId?: string;
    positionId?: string;
}
