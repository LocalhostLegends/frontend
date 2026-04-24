import { Injectable } from '@angular/core';
import { InviteApiService, ValidateInviteResponse } from '../../../core/api/invite-api.service';
import { SuccessResponse } from '../../../core/api/api-types';
import { CreateInviteRequest, Invite } from '../../../core/models/invite.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InviteService {
  constructor(private api: InviteApiService) {}

  createInvite(
    email: string,
    role: 'hr' | 'employee',
    options?: Pick<CreateInviteRequest, 'departmentId' | 'positionId'>,
  ): Observable<Invite> {
    return this.api.createInvite({
      email,
      role,
      ...options,
    });
  }

  validateInvite(token: string): Observable<ValidateInviteResponse> {
    return this.api.validateInvite(token);
  }

  acceptInvite(
    token: string,
    firstName: string,
    lastName: string,
    password: string,
  ): Observable<SuccessResponse> {
    return this.api.acceptInvite({ token, firstName, lastName, password });
  }

  resendInvite(inviteId: string): Observable<Invite> {
    return this.api.resendInvite({ inviteId });
  }

  cancelInvite(id: string): Observable<void> {
    return this.api.cancelInvite(id);
  }

  getCompanyInvites(): Observable<Invite[]> {
    return this.api.getCompanyInvites();
  }

  getPendingInvites(): Observable<Invite[]> {
    return this.api.getPendingInvites();
  }
}
