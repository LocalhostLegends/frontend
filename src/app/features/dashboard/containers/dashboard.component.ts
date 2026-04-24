import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '../../../core/models/user.model';
import { Invite } from '../../../core/models/invite.model';

import { AuthService } from '../../../core/services/auth.service';
import { DashboardDataService, DashboardLoadResult } from '../services/dashboard-data.service';
import { CompanyApiService } from '../../../core/api/company-api.service';
import { UserApiService } from '../../../core/api/user-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private dashboardService = inject(DashboardDataService);
  private companyApi = inject(CompanyApiService);
  private userApi = inject(UserApiService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  users = signal<User[]>([]);
  invites = signal<Invite[]>([]);
  isLoading = signal(false);
  companyNameFromApi = signal('');
  hasDashboardDataError = signal(false);

  userRole = computed(() => this.auth.userRole());
  companyName = computed(() => {
    const value = this.companyNameFromApi().trim() || this.auth.currentUser()?.companyName?.trim();
    return value ? value : 'Company Name';
  });
  statusLabel = computed(() => {
    const role = this.userRole();
    if (role === 'admin') return 'Administrator';
    if (role === 'hr') return 'HR Manager';
    if (role === 'employee') return 'Employee';
    return 'User';
  });

  totalEmployees = computed(() => this.users().filter((user) => user.role !== 'admin').length);
  hrCount = computed(() => this.users().filter((user) => user.role === 'hr').length);
  invitedCount = computed(
    () => this.invites().filter((invite) => invite.status === 'pending').length,
  );
  departmentsCount = computed(() => {
    const ids = new Set(
      this.invites()
        .map((i) => i.departmentId)
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    );
    return ids.size;
  });
  activeVacancies = computed(() => 0);
  isAdmin = computed(() => this.userRole() === 'admin');

  requests = [
    {
      type: 'Leave requests',
      count: 0,
      details: 'No current leave requests',
    },
    {
      type: 'Offers',
      count: 0,
      details: 'No offers yet',
    },
  ];

  recentActivities = computed(() => {
    return this.invites()
      .slice(0, 5)
      .map((invite) => ({
        text: `${invite.email} — ${invite.status}`,
        date: invite.acceptedAt || invite.createdAt || invite.expiresAt,
      }));
  });

  ngOnInit() {
    this.loadCompanyName();
    this.load();
  }

  private normalizeArray<T>(value: unknown, nestedKey?: string): T[] {
    if (Array.isArray(value)) {
      return value as T[];
    }

    if (nestedKey && value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const nested = record[nestedKey];
      if (Array.isArray(nested)) {
        return nested as T[];
      }
    }

    return [];
  }

  load() {
    if (this.userRole() === 'employee') {
      this.users.set([]);
      this.invites.set([]);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);

    this.dashboardService.load().subscribe({
      next: ({ users, invites, usersError, invitesError }: DashboardLoadResult) => {
        this.users.set(this.normalizeArray<User>(users, 'users'));
        this.invites.set(this.normalizeArray<Invite>(invites, 'invites'));
        this.isLoading.set(false);
        this.hasDashboardDataError.set(!!(usersError || invitesError));

        if (usersError && invitesError) {
          const usersStatus = this.describeError(usersError);
          const invitesStatus = this.describeError(invitesError);
          this.notify(
            `Не вдалося завантажити користувачів (${usersStatus}) і інвайти (${invitesStatus})`,
            'Close',
            4500,
          );
          return;
        }
        if (usersError) {
          this.notify(
            `Не вдалося завантажити список користувачів (${this.describeError(usersError)})`,
            'Close',
            3500,
          );
        } else if (invitesError) {
          this.notify(
            `Не вдалося завантажити список інвайтів (${this.describeError(invitesError)})`,
            'Close',
            3500,
          );
        }
      },
      error: () => {
        this.users.set([]);
        this.invites.set([]);
        this.isLoading.set(false);
        this.hasDashboardDataError.set(true);
        this.notify('Unable to load dashboard data', 'Close', 3000);
      },
    });
  }

  private describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const status = typeof error.status === 'number' ? error.status : 'unknown';
      const payload = error.error as Record<string, unknown> | string | null | undefined;
      const messageFromPayload =
        payload && typeof payload === 'object' && typeof payload['message'] === 'string'
          ? payload['message']
          : typeof payload === 'string'
            ? payload
            : error.message;
      return messageFromPayload ? `${status}: ${messageFromPayload}` : String(status);
    }
    if (error instanceof Error) {
      return error.message || 'unknown';
    }
    if (error && typeof error === 'object') {
      const record = error as Record<string, unknown>;
      const status =
        typeof record['status'] === 'number' || typeof record['status'] === 'string'
          ? String(record['status'])
          : '';
      const message = typeof record['message'] === 'string' ? record['message'] : '';
      if (status && message) return `${status}: ${message}`;
      if (message) return message;
      if (status) return status;
    }
    return typeof error === 'string' && error ? error : 'unknown';
  }

  private loadCompanyName() {
    this.userApi.getProfile().subscribe({
      next: (profile) => {
        const profileRecord = profile as unknown as Record<string, unknown>;
        const company =
          profileRecord['company'] && typeof profileRecord['company'] === 'object'
            ? (profileRecord['company'] as Record<string, unknown>)
            : null;
        const profileName =
          (company && typeof company['name'] === 'string' && company['name']) ||
          (typeof profileRecord['companyName'] === 'string' && profileRecord['companyName']) ||
          '';
        const normalized = profileName.trim();
        if (normalized) {
          this.companyNameFromApi.set(normalized);
          return;
        }
        this.loadCompanyNameFallback();
      },
      error: () => {
        this.loadCompanyNameFallback();
      },
    });
  }

  private loadCompanyNameFallback() {
    this.companyApi.getMyCompany().subscribe({
      next: (company) => {
        const companyRecord = company as unknown as Record<string, unknown>;
        const rawName =
          (typeof companyRecord['name'] === 'string' && companyRecord['name']) ||
          (typeof companyRecord['companyName'] === 'string' && companyRecord['companyName']) ||
          '';
        const normalized = rawName.trim();
        if (normalized) {
          this.companyNameFromApi.set(normalized);
          return;
        }
        if (this.hasDashboardDataError()) return;
        this.notify('Не вдалося отримати назву компанії (порожня відповідь)', 'Close', 4500);
      },
      error: (error: unknown) => {
        if (this.hasDashboardDataError()) return;
        this.notify(
          `Не вдалося отримати назву компанії (${this.describeError(error)})`,
          'Close',
          4500,
        );
      },
    });
  }

  private notify(message: string, action = 'Close', duration = 3500) {
    this.snackBar.dismiss();
    this.snackBar.open(message, action, { duration });
  }

  onInviteHr() {
    this.router.navigate(['/app/invites'], { state: { role: 'hr' } });
  }

  onInviteEmployee() {
    this.router.navigate(['/app/invites'], { state: { role: 'employee' } });
  }

  onCreateDepartment() {
    this.router.navigate(['/app/departments']);
  }

  onInviteTeam() {
    if (this.userRole() === 'admin') {
      this.onInviteHr();
      return;
    }
    this.onInviteEmployee();
  }
}
