import { Injectable, inject } from '@angular/core';
import { UserApiService } from '../../../core/api/user-api.service';
import { InviteService } from '../../invites/services/invite.service';
import { forkJoin } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private api = inject(UserApiService);
  private inviteService = inject(InviteService);

  load() {
    return forkJoin({
      users: this.api.getUsers(),
      invites: this.inviteService.getCompanyInvites(),
    });
  }
}
