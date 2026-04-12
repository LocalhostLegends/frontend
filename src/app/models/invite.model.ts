import { User } from './user.model';

export interface Invite {
  id: string;
  email: string;
  role: 'hr' | 'employee';
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  invitedBy: string; // user id
  companyId: string;
  companyName?: string;
}

export interface CreateInviteRequest {
  email: string;
  role: 'hr' | 'employee';
}

export interface ValidateInviteResponse {
  valid: boolean;
  invite?: Invite;
  message?: string;
}

export interface AcceptInviteRequest {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface AcceptInviteResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface ResendInviteRequest {
  inviteId: string;
}

export interface ResendInviteResponse {
  success: boolean;
  message?: string;
}
