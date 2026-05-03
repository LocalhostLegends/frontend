import { Injectable } from '@angular/core';
import { InviteApiService, ValidateInviteResponse } from '@app/core/api/invite-api.service';
import { LoginResponse } from '@app/core/api/auth-api.service';
import { CreateInviteRequest, Invite } from '@app/core/models/invite.model';
import { UserRole } from '@app/core/constants/roles.constants';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class InviteService {
    constructor(private api: InviteApiService) { }
    createInvite(email: string, role: UserRole, options?: Pick<CreateInviteRequest, 'departmentId' | 'positionId'>): Observable<Invite> {
        return this.api.createInvite({
            email,
            role,
            ...options,
        });
    }
    validateInvite(token: string): Observable<ValidateInviteResponse> {
        return this.api.validateInvite(token);
    }
    acceptInvite(token: string, firstName: string, lastName: string, password: string): Observable<LoginResponse | null> {
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
