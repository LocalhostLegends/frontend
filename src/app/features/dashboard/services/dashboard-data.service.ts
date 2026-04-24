import { Injectable, inject } from '@angular/core';
import { UserApiService } from '../../../core/api/user-api.service';
import { InviteService } from '../../invites/services/invite.service';
import { catchError, forkJoin, map, of } from 'rxjs';

export interface DashboardLoadResult {
  users: unknown;
  invites: unknown;
  usersError: unknown | null;
  invitesError: unknown | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private api = inject(UserApiService);
  private inviteService = inject(InviteService);

  load() {
    return forkJoin({
      users: this.api.getUsers().pipe(
        map((data) => ({ data, error: null as unknown | null })),
        catchError((error) => of({ data: [], error })),
      ),
      invites: this.inviteService.getCompanyInvites().pipe(
        map((data) => ({ data, error: null as unknown | null })),
        catchError((error) => of({ data: [], error })),
      ),
    }).pipe(
      map(({ users, invites }) => {
        return {
          users: users.data,
          invites: invites.data,
          usersError: users.error,
          invitesError: invites.error,
        } as DashboardLoadResult;
      }),
    );
  }
}
