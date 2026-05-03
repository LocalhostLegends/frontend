import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { User } from '@app/core/models/user.model';
import { Invite } from '@app/core/models/invite.model';
import { getRoleLabel, UserRole, canSeeOrganizationData, isAdminRole, canSendInvites, canViewDepartments, } from '@app/core/constants/roles.constants';
import { AuthService } from '@app/core/services/auth.service';
import { DashboardDataService, DashboardLoadResult } from '@app/features/dashboard/services/dashboard-data.service';
import { CompanyApiService } from '@app/core/api/company-api.service';
import { UserApiService } from '@app/core/api/user-api.service';
import { InviteSetupWizardDialogComponent, InviteSetupWizardDialogData, } from '@app/features/invites/invite-setup-wizard-dialog.component';
import { birthdaysThisWeek, usersAbsentToday, type BirthdayWeekItem, } from '@app/features/dashboard/utils/hr-dashboard.helpers';
import { PaginationControlsComponent } from '@app/core/ui/pagination-controls/pagination-controls.component';
@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        PaginationControlsComponent,
        MatIconModule,
        MatProgressBarModule,
    ],
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
    private dialog = inject(MatDialog);
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
    statusLabel = computed(() => getRoleLabel(this.userRole()));
    totalEmployees = computed(() => this.users().filter((user) => user.role !== 'admin').length);
    hrCount = computed(() => this.users().filter((user) => user.role === 'hr').length);
    pendingInvitesCount = computed(() => this.invites().filter((i) => (i.status ?? '').trim().toLowerCase() === 'pending').length);
    departmentsCount = computed(() => {
        const ids = new Set(this.invites()
            .map((i) => i.departmentId)
            .filter((value): value is string => typeof value === 'string' && value.length > 0));
        return ids.size;
    });
    activeVacancies = computed(() => 0);
    isAdmin = computed(() => isAdminRole(this.userRole()));
    canInvite = computed(() => canSendInvites(this.userRole()));
    showCreateDepartment = computed(() => canViewDepartments(this.userRole()));
    isHrDashboard = computed(() => this.userRole() === 'hr');
    isEmployeeDashboard = computed(() => this.userRole() === 'employee');
    isManagerDashboard = computed(() => this.userRole() === 'manager');
    currentUserId = computed(() => this.auth.currentUser()?.id ?? '');
    vacationBalanceText = computed(() => {
        const u = this.auth.currentUser();
        const n = u?.vacationDaysRemaining;
        if (typeof n === 'number' && !Number.isNaN(n)) {
            return n;
        }
        return null;
    });
    companyAnnouncements = signal<Array<{
        id: string;
        title: string;
        excerpt: string;
        date: string;
        authorRole: string;
    }>>([]);
    employeeTasksToday = signal<Array<{
        id: string;
        title: string;
    }>>([]);
    empDirectoryColumns = ['name', 'email', 'role'];
    departmentTitle = computed(() => {
        const d = this.auth.currentUser()?.department?.name?.trim();
        return d ? d : 'Your department';
    });
    employeeHeroName = computed(() => {
        const u = this.auth.currentUser();
        const n = `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim();
        return n || u?.email || 'there';
    });
    managerTeamUsers = computed(() => {
        const id = this.currentUserId();
        return this.users().filter((u) => u.id !== id);
    });
    departmentGoalsProgressPercent = signal<number | null>(null);
    managerDeadlineAlerts = signal<Array<{
        id: string;
        employeeLabel: string;
        message: string;
    }>>([]);
    teamActivityFeed = computed(() => {
        const rows = this.managerTeamUsers()
            .map((u) => {
            const raw = u.lastLoginAt || u.updatedAt || '';
            const t = raw ? new Date(raw).getTime() : 0;
            return {
                user: u,
                label: this.activityLabel(u),
                date: raw,
                sort: t,
            };
        })
            .filter((r) => r.sort > 0)
            .sort((a, b) => b.sort - a.sort)
            .slice(0, 8);
        return rows;
    });
    absentTodayUsers = computed(() => usersAbsentToday(this.users()));
    birthdaysWeekItems = computed(() => birthdaysThisWeek(this.users()));
    hrSearch = signal('');
    hrRoleFilter = signal<UserRole | ''>('');
    hrStatusFilter = signal('');
    hrTableColumns = ['name', 'email', 'role', 'department', 'status'];
    readonly adminDashboardColumns = ['name', 'email', 'role', 'department', 'status'];
    /** Client-side pagination for admin Team members table (same control as Employees page). */
    adminMembersPage = signal(1);
    adminMembersLimit = signal(10);
    adminMembersPagedUsers = computed(() => {
        const list = this.users();
        const page = this.adminMembersPage();
        const limit = this.adminMembersLimit();
        const start = (page - 1) * limit;
        return list.slice(start, start + limit);
    });
    filteredHrUsers = computed(() => {
        const list = this.users();
        const q = this.hrSearch().trim().toLowerCase();
        const role = this.hrRoleFilter();
        const status = this.hrStatusFilter().trim().toLowerCase();
        return list.filter((u) => {
            if (role && u.role !== role)
                return false;
            if (status && (u.status ?? '').trim().toLowerCase() !== status)
                return false;
            if (q) {
                const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim().toLowerCase();
                const email = (u.email ?? '').toLowerCase();
                if (!name.includes(q) && !email.includes(q))
                    return false;
            }
            return true;
        });
    });
    hrRoleFilterOptions: UserRole[] = ['admin', 'hr', 'manager', 'employee'];
    hrStatusFilterOptions = ['active', 'invited', 'blocked'];
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

    constructor() {
        effect(() => {
            const total = this.users().length;
            const limit = this.adminMembersLimit();
            const maxPage = total === 0 ? 1 : Math.max(1, Math.ceil(total / limit));
            if (this.adminMembersPage() > maxPage) {
                this.adminMembersPage.set(maxPage);
            }
        });
    }

    adminMembersPrev(): void {
        if (this.adminMembersPage() > 1) {
            this.adminMembersPage.update((p) => p - 1);
        }
    }

    adminMembersNext(): void {
        const total = this.users().length;
        const limit = this.adminMembersLimit();
        const page = this.adminMembersPage();
        if (page * limit < total) {
            this.adminMembersPage.update((p) => p + 1);
        }
    }

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
        const role = this.userRole();
        if (role === 'employee' || role === 'manager') {
            this.loadDepartmentPeerUsers();
            return;
        }
        if (!canSeeOrganizationData(role)) {
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
                    this.notify(`Не вдалося завантажити користувачів (${usersStatus}) і інвайти (${invitesStatus})`, 'Close', 4500);
                    return;
                }
                if (usersError) {
                    this.notify(`Не вдалося завантажити список користувачів (${this.describeError(usersError)})`, 'Close', 3500);
                }
                else if (invitesError) {
                    this.notify(`Не вдалося завантажити список інвайтів (${this.describeError(invitesError)})`, 'Close', 3500);
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
    private loadDepartmentPeerUsers(): void {
        this.isLoading.set(true);
        this.hasDashboardDataError.set(false);
        this.userApi
            .getUsersAllPages({ sortBy: 'firstName', sortOrder: 'asc' })
            .pipe(catchError(() => {
            this.hasDashboardDataError.set(true);
            return of([] as User[]);
        }), finalize(() => this.isLoading.set(false)))
            .subscribe((all) => {
            const me = this.auth.currentUser();
            const deptId = me?.department?.id?.trim();
            let list: User[] = all;
            if (deptId) {
                list = all.filter((u) => u.department?.id === deptId);
            }
            else {
                const id = me?.id;
                list = id ? all.filter((u) => u.id === id) : [];
            }
            if (list.length === 0 && me?.id) {
                list = [me as User];
            }
            this.users.set(list);
            this.invites.set([]);
        });
    }
    private describeError(error: unknown): string {
        if (error instanceof HttpErrorResponse) {
            const status = typeof error.status === 'number' ? error.status : 'unknown';
            const payload = error.error as Record<string, unknown> | string | null | undefined;
            const messageFromPayload = payload && typeof payload === 'object' && typeof payload['message'] === 'string'
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
            const status = typeof record['status'] === 'number' || typeof record['status'] === 'string'
                ? String(record['status'])
                : '';
            const message = typeof record['message'] === 'string' ? record['message'] : '';
            if (status && message)
                return `${status}: ${message}`;
            if (message)
                return message;
            if (status)
                return status;
        }
        return typeof error === 'string' && error ? error : 'unknown';
    }
    private loadCompanyName() {
        this.userApi.getProfile().subscribe({
            next: (profile) => {
                const profileRecord = profile as unknown as Record<string, unknown>;
                const company = profileRecord['company'] && typeof profileRecord['company'] === 'object'
                    ? (profileRecord['company'] as Record<string, unknown>)
                    : null;
                const profileName = (company && typeof company['name'] === 'string' && company['name']) ||
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
                const rawName = (typeof companyRecord['name'] === 'string' && companyRecord['name']) ||
                    (typeof companyRecord['companyName'] === 'string' && companyRecord['companyName']) ||
                    '';
                const normalized = rawName.trim();
                if (normalized) {
                    this.companyNameFromApi.set(normalized);
                    return;
                }
                if (this.hasDashboardDataError())
                    return;
                this.notify('Не вдалося отримати назву компанії (порожня відповідь)', 'Close', 4500);
            },
            error: (error: unknown) => {
                if (this.hasDashboardDataError())
                    return;
                this.notify(`Не вдалося отримати назву компанії (${this.describeError(error)})`, 'Close', 4500);
            },
        });
    }
    private notify(message: string, action = 'Close', duration = 3500) {
        this.snackBar.dismiss();
        this.snackBar.open(message, action, { duration });
    }
    private openInviteWizard(data?: InviteSetupWizardDialogData) {
        this.dialog
            .open(InviteSetupWizardDialogComponent, {
            width: '560px',
            maxWidth: '95vw',
            disableClose: true,
            autoFocus: 'first-heading',
            data,
        })
            .afterClosed()
            .subscribe((result) => {
            if (result === 'sent') {
                this.load();
            }
        });
    }
    onInviteHr() {
        this.openInviteWizard();
    }
    onInvitePerson() {
        this.openInviteWizard({ presetRole: 'employee' });
    }
    onCreateDepartment() {
        this.router.navigate(['/app/departments']);
    }
    onInviteTeam() {
        if (isAdminRole(this.userRole())) {
            this.openInviteWizard();
            return;
        }
        this.openInviteWizard({ presetRole: 'employee' });
    }
    displayName(user: User): string {
        const n = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
        return n || user.email || '—';
    }
    departmentLabel(user: User): string {
        return user.department?.name?.trim() || '—';
    }
    formatBirthdayRow(item: BirthdayWeekItem): string {
        return item.occurrence.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    }
    roleLabelSafe(role: string): string {
        return getRoleLabel(role as UserRole);
    }
    clearHrFilters(): void {
        this.hrSearch.set('');
        this.hrRoleFilter.set('');
        this.hrStatusFilter.set('');
    }
    goToEmployees(): void {
        this.router.navigate(['/app/employees']);
    }
    isCurrentUserRow(user: User): boolean {
        return !!this.currentUserId() && user.id === this.currentUserId();
    }
    goalsBarPercent(): number {
        const v = this.departmentGoalsProgressPercent();
        if (typeof v === 'number' && v >= 0 && v <= 100) {
            return Math.round(v);
        }
        return 62;
    }
    goalsBarIsDemo(): boolean {
        return this.departmentGoalsProgressPercent() === null;
    }
    private activityLabel(u: User): string {
        if (u.lastLoginAt) {
            return 'Signed in';
        }
        if (u.updatedAt) {
            return 'Profile updated';
        }
        return 'Activity';
    }
    formatActivityWhen(raw: string): string {
        if (!raw)
            return '';
        const d = new Date(raw);
        if (Number.isNaN(d.getTime()))
            return raw;
        return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    }
    hrStatusPillClass(user: User): string {
        const s = (user.status ?? '').trim().toLowerCase();
        if (s === 'active')
            return 'hr-pill hr-pill--active';
        if (s === 'pending' || s === 'invited')
            return 'hr-pill hr-pill--pending';
        if (s === 'blocked')
            return 'hr-pill hr-pill--blocked';
        if (s === 'inactive')
            return 'hr-pill hr-pill--inactive';
        return 'hr-pill hr-pill--muted';
    }
    hrStatusLabel(user: User): string {
        const s = user.status?.trim();
        return s ? s : '—';
    }
}
