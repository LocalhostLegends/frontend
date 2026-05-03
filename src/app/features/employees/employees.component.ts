import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { UserApiService } from '@app/core/api/user-api.service';
import { User } from '@app/core/models/user.model';
import { AuthService } from '@app/core/services/auth.service';
import { UserRole, isAdminRole, getInvitableRoles, canHrModifyUser, } from '@app/core/constants/roles.constants';
import { LoadingButtonComponent } from '@app/core/ui/loading-button/loading-button.component';
import { TableActionItem, TableActionsMenuComponent, } from '@app/core/ui/table-actions-menu/table-actions-menu.component';
import { PaginationControlsComponent } from '@app/core/ui/pagination-controls/pagination-controls.component';
@Component({
    selector: 'app-employees',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatTableModule,
        LoadingButtonComponent,
        TableActionsMenuComponent,
        PaginationControlsComponent,
    ],
    templateUrl: './employees.component.html',
    styleUrls: ['./employees.component.scss'],
})
export class EmployeesComponent implements OnInit {
    private fb = inject(NonNullableFormBuilder);
    private userApi = inject(UserApiService);
    private snackBar = inject(MatSnackBar);
    private auth = inject(AuthService);
    users = signal<User[]>([]);
    total = signal(0);
    page = signal(1);
    limit = signal(10);
    isLoading = signal(false);
    isSaving = signal(false);
    busyIds = signal<Set<string>>(new Set());
    editingUserId = signal<string | null>(null);
    isEditLoading = signal(false);
    viewedUser = signal<User | null>(null);
    isViewLoading = signal(false);
    readonly displayedColumns = ['name', 'email', 'role', 'department', 'status', 'lastLogin', 'actions'];
    readonly filterRoles: UserRole[] = ['admin', 'hr', 'manager', 'employee'];
    readonly filterStatuses = ['active', 'invited', 'blocked'];
    readonly editStatuses = ['active', 'invited', 'blocked', 'inactive'];
    readonly editRoleOptions = computed(() => {
        const v = this.auth.userRole();
        if (v === 'hr')
            return getInvitableRoles('hr');
        return ['admin', 'hr', 'manager', 'employee'] as UserRole[];
    });
    readonly isAdmin = computed(() => isAdminRole(this.auth.userRole()));
    filtersForm = this.fb.group({
        search: [''],
        role: [''],
        status: [''],
    });
    editForm = this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        phone: [''],
        role: ['employee'],
        status: ['active'],
    });
    ngOnInit(): void {
        this.loadUsers();
    }
    loadUsers(page = this.page()): void {
        this.page.set(page);
        this.isLoading.set(true);
        const filters = this.filtersForm.getRawValue();
        this.userApi
            .getUsersPage({
            page: this.page(),
            limit: this.limit(),
            search: filters.search.trim(),
            role: filters.role || undefined,
            status: filters.status || undefined,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        })
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: (payload) => {
                this.users.set(payload.users ?? []);
                this.total.set(payload.total ?? 0);
                this.page.set(payload.page ?? this.page());
                this.limit.set(payload.limit ?? this.limit());
            },
            error: (error: HttpErrorResponse) => {
                this.snackBar.open(this.describeError(error, 'Failed to load users'), 'Close', {
                    duration: 3500,
                });
            },
        });
    }
    applyFilters(): void {
        this.loadUsers(1);
    }
    resetFilters(): void {
        this.filtersForm.reset({ search: '', role: '', status: '' });
        this.loadUsers(1);
    }
    canPrev(): boolean {
        return this.page() > 1;
    }
    canNext(): boolean {
        return this.page() * this.limit() < this.total();
    }
    prevPage(): void {
        if (!this.canPrev())
            return;
        this.loadUsers(this.page() - 1);
    }
    nextPage(): void {
        if (!this.canNext())
            return;
        this.loadUsers(this.page() + 1);
    }
    startEdit(user: User): void {
        if (!canHrModifyUser(this.auth.userRole(), user.role)) {
            this.snackBar.open('You cannot edit the company administrator.', 'Close', { duration: 4000 });
            return;
        }
        this.editingUserId.set(user.id);
        this.isEditLoading.set(true);
        this.userApi
            .getUserById(user.id)
            .pipe(finalize(() => this.isEditLoading.set(false)))
            .subscribe({
            next: (fullUser) => {
                this.viewedUser.set(fullUser);
                this.editForm.setValue({
                    firstName: fullUser.firstName ?? '',
                    lastName: fullUser.lastName ?? '',
                    phone: fullUser.phone ?? '',
                    role: (fullUser.role ?? 'employee') as UserRole,
                    status: this.normalizeStatusForForm(fullUser.status ?? 'active'),
                });
            },
            error: (error: HttpErrorResponse) => {
                this.snackBar.open(this.describeError(error, 'Failed to load user details'), 'Close', {
                    duration: 3500,
                });
            },
        });
    }
    private normalizeStatusForForm(raw: string): string {
        const s = (raw || 'active').trim().toLowerCase();
        if (s === 'pending')
            return 'invited';
        return s;
    }
    cancelEdit(): void {
        this.editingUserId.set(null);
        this.editForm.reset({
            firstName: '',
            lastName: '',
            phone: '',
            role: 'employee',
            status: 'active',
        });
    }
    viewUser(user: User): void {
        this.isViewLoading.set(true);
        this.userApi
            .getUserById(user.id)
            .pipe(finalize(() => this.isViewLoading.set(false)))
            .subscribe({
            next: (fullUser) => {
                this.viewedUser.set(fullUser);
            },
            error: (error: HttpErrorResponse) => {
                this.snackBar.open(this.describeError(error, 'Failed to load user details'), 'Close', {
                    duration: 3500,
                });
            },
        });
    }
    saveEdit(): void {
        const id = this.editingUserId();
        if (!id)
            return;
        if (this.editForm.invalid) {
            this.editForm.markAllAsTouched();
            return;
        }
        const raw = this.editForm.getRawValue();
        if (this.auth.userRole() === 'hr' && raw.role === 'admin') {
            this.snackBar.open('HR cannot assign the Administrator role.', 'Close', { duration: 4000 });
            return;
        }
        this.isSaving.set(true);
        this.userApi
            .updateUser(id, {
            firstName: raw.firstName.trim(),
            lastName: raw.lastName.trim(),
            phone: raw.phone.trim() || null,
            role: raw.role as UserRole,
            status: raw.status,
        })
            .pipe(finalize(() => this.isSaving.set(false)))
            .subscribe({
            next: () => {
                this.snackBar.open('User updated', 'Close', { duration: 2500 });
                this.cancelEdit();
                this.loadUsers(this.page());
            },
            error: (error: HttpErrorResponse) => {
                this.snackBar.open(this.describeError(error, 'Failed to update user'), 'Close', {
                    duration: 4000,
                });
            },
        });
    }
    getActions(user: User): TableActionItem[] {
        const isBusy = this.isBusy(user.id);
        if (!canHrModifyUser(this.auth.userRole(), user.role)) {
            return [{ id: 'view', label: 'View details', icon: 'visibility', disabled: isBusy }];
        }
        const actions: TableActionItem[] = [
            { id: 'view', label: 'View details', icon: 'visibility', disabled: isBusy },
            { id: 'edit', label: 'Edit', icon: 'edit', disabled: isBusy },
        ];
        if (this.isAdmin()) {
            const isBlocked = (user.status ?? '').toLowerCase() === 'blocked';
            actions.push({
                id: isBlocked ? 'unblock' : 'block',
                label: isBlocked ? 'Unblock' : 'Block',
                icon: isBlocked ? 'lock_open' : 'lock',
                disabled: isBusy,
            });
        }
        actions.push({
            id: 'delete',
            label: 'Delete',
            icon: 'delete',
            disabled: isBusy,
            confirmMessage: `Delete user ${user.email}?`,
        });
        return actions;
    }
    onAction(actionId: string, user: User): void {
        if (actionId === 'view') {
            this.viewUser(user);
            return;
        }
        if (!canHrModifyUser(this.auth.userRole(), user.role)) {
            return;
        }
        if (actionId === 'edit') {
            this.startEdit(user);
            return;
        }
        if (actionId === 'block') {
            this.toggleBlock(user, true);
            return;
        }
        if (actionId === 'unblock') {
            this.toggleBlock(user, false);
            return;
        }
        if (actionId === 'delete') {
            this.softDelete(user);
        }
    }
    private toggleBlock(user: User, block: boolean): void {
        if (!canHrModifyUser(this.auth.userRole(), user.role))
            return;
        this.setBusy(user.id, true);
        const request$ = block ? this.userApi.blockUser(user.id) : this.userApi.unblockUser(user.id);
        request$.pipe(finalize(() => this.setBusy(user.id, false))).subscribe({
            next: () => {
                this.snackBar.open(block ? 'User blocked' : 'User unblocked', 'Close', { duration: 2500 });
                this.loadUsers(this.page());
            },
            error: (error: HttpErrorResponse) => {
                this.snackBar.open(this.describeError(error, block ? 'Failed to block user' : 'Failed to unblock user'), 'Close', { duration: 4000 });
            },
        });
    }
    private softDelete(user: User): void {
        if (!canHrModifyUser(this.auth.userRole(), user.role))
            return;
        this.setBusy(user.id, true);
        this.userApi
            .deleteUser(user.id)
            .pipe(finalize(() => this.setBusy(user.id, false)))
            .subscribe({
            next: () => {
                this.snackBar.open('User deleted', 'Close', { duration: 2500 });
                this.loadUsers(this.page());
            },
            error: (error: HttpErrorResponse) => {
                this.snackBar.open(this.describeError(error, 'Failed to delete user'), 'Close', {
                    duration: 4000,
                });
            },
        });
    }
    isBusy(id: string): boolean {
        return this.busyIds().has(id);
    }
    displayName(user: User): string {
        const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
        return fullName || user.email;
    }
    departmentLabel(user: User): string {
        return user.department?.name?.trim() || '—';
    }
    private setBusy(id: string, state: boolean): void {
        this.busyIds.update((prev) => {
            const next = new Set(prev);
            if (state)
                next.add(id);
            else
                next.delete(id);
            return next;
        });
    }
    private describeError(error: HttpErrorResponse, fallback: string): string {
        const payload = error?.error as Record<string, unknown> | string | undefined;
        if (payload && typeof payload === 'object') {
            const message = payload['message'];
            if (typeof message === 'string' && message.trim())
                return message;
            if (Array.isArray(message) && message.length)
                return message.map(String).join('; ');
            if (typeof payload['error'] === 'string' && payload['error'])
                return String(payload['error']);
        }
        if (typeof payload === 'string' && payload.trim())
            return payload;
        return fallback;
    }
}
