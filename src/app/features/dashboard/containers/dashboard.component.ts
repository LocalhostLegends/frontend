import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '../../../core/models/user.model';
import { Invite } from '../../../core/models/invite.model';

import { AuthService } from '../../../core/services/auth.service';
import { UserApiService } from '../../../core/api/user-api.service';
import { DashboardDataService } from '../services/dashboard-data.service';

import { getAdminWidgets } from '../widgets/admin-widgets';
import { getHrWidgets } from '../widgets/hr-widgets';
import { getEmployeeWidgets } from '../widgets/employee-widgets';

import { DashboardWidget } from '../models/dashboard-widget.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private api = inject(UserApiService);
  private dashboardService = inject(DashboardDataService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  users = signal<User[]>([]);
  invites = signal<Invite[]>([]);
  isLoading = signal(false);

  userRole = computed(() => this.auth.userRole());
  companyName = computed(() => this.auth.currentUser()?.companyName ?? 'Company');

  totalEmployees = computed(() => this.users().filter((user) => user.role !== 'admin').length);
  hrCount = computed(() => this.users().filter((user) => user.role === 'hr').length);
  activeCount = computed(() => this.users().length);
  invitedCount = computed(
    () => this.invites().filter((invite) => invite.status === 'pending').length,
  );
  teamMembers = computed(() => this.users().filter((user) => user.role !== 'admin'));

  displayedColumns = ['name', 'email', 'role', 'actions'];

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

  widgets = computed<DashboardWidget[]>(() => {
    const role = this.userRole();

    if (role === 'admin') {
      return getAdminWidgets({
        headcount: { total: this.users().length, turnover: 5 },
        financial: { salaryExpenses: 50000, charts: [] },
        settings: { name: this.companyName(), logo: 'assets/logo.svg' },
        activity: [{ action: 'User invited', time: '2h ago' }],
      });
    }

    if (role === 'hr') {
      return getHrWidgets({
        invites: this.invites().filter((invite) => invite.status === 'pending'),
        pipeline: { candidates: 12, responses: 5 },
        leaves: { employees: ['John'] },
        birthdays: { employees: ['Alice'] },
      });
    }

    if (role === 'employee') {
      return getEmployeeWidgets({
        vacation: { balance: 10, used: 5 },
        requests: this.requests,
        courses: { completed: 2, inProgress: 1 },
        team: { online: 5, total: 10 },
      });
    }

    return [];
  });

  ngOnInit() {
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
    this.isLoading.set(true);

    this.dashboardService.load().subscribe({
      next: ({ users, invites }: { users: unknown; invites: unknown }) => {
        this.users.set(this.normalizeArray<User>(users, 'users'));
        this.invites.set(this.normalizeArray<Invite>(invites, 'invites'));
        this.isLoading.set(false);
      },
      error: () => {
        this.users.set([]);
        this.invites.set([]);
        this.isLoading.set(false);
        this.snackBar.open('Unable to load dashboard data', 'Close', { duration: 3000 });
      },
    });
  }

  onInviteHr() {
    this.router.navigate(['/app/invites'], { state: { role: 'hr' } });
  }

  onInviteEmployee() {
    this.router.navigate(['/app/invites'], { state: { role: 'employee' } });
  }

  onBlockUser(user: User) {
    this.snackBar.open(`Block action for ${user.email} is not yet implemented`, 'Close', {
      duration: 4000,
    });
  }

  onDeleteUser(id: string) {
    const confirmed = confirm('Delete this team member?');

    if (!confirmed) {
      return;
    }

    this.api.deleteUser(id).subscribe({
      next: () => {
        this.snackBar.open('User removed', 'Close', { duration: 3000 });
        this.load();
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        this.snackBar.open('Unable to delete user', 'Close', { duration: 3000 });
      },
    });
  }
}
