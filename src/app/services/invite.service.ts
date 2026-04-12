import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Invite } from '../models/invite.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class InviteService {
  constructor(private api: ApiService) {}

  createInvite(email: string, role: 'hr' | 'employee'): Observable<Invite> {
    return this.api
      .createInvite({ email, role })
      .pipe(tap(() => console.log('Invite created successfully')));
  }

  validateInvite(token: string): Observable<any> {
    return this.api.validateInvite(token);
  }

  acceptInvite(
    token: string,
    firstName: string,
    lastName: string,
    password: string,
  ): Observable<any> {
    return this.api
      .acceptInvite({ token, firstName, lastName, password })
      .pipe(tap(() => console.log('Invite accepted successfully')));
  }

  resendInvite(inviteId: string): Observable<any> {
    return this.api
      .resendInvite({ inviteId })
      .pipe(tap(() => console.log('Invite resent successfully')));
  }

  cancelInvite(id: string): Observable<any> {
    return this.api.cancelInvite(id).pipe(tap(() => console.log('Invite cancelled successfully')));
  }

  getCompanyInvites(): Observable<Invite[]> {
    return this.api.getCompanyInvites();
  }

  getPendingInvites(): Observable<Invite[]> {
    return this.api.getPendingInvites();
  }
}
