import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { DepartmentApiService } from '@app/core/api/department-api.service';
import { Department } from '@app/core/models/department.model';
import { LoadingButtonComponent } from '@app/core/ui/loading-button/loading-button.component';
import { AuthService } from '@app/core/services/auth.service';
import { canManageDepartments } from '@app/core/constants/roles.constants';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent } from '@app/core/ui/confirm-dialog/confirm-dialog.component';
@Component({
    selector: 'app-departments',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatTableModule,
        LoadingButtonComponent,
        TranslatePipe,
    ],
    templateUrl: './departments.component.html',
    styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit {
    private fb = inject(NonNullableFormBuilder);
    private departmentApi = inject(DepartmentApiService);
    private snackBar = inject(MatSnackBar);
    private dialog = inject(MatDialog);
    private auth = inject(AuthService);
    private translate = inject(TranslateService);
    readonly canEditStructure = () => canManageDepartments(this.auth.userRole());
    departments = signal<Department[]>([]);
    isLoading = signal(false);
    isSubmitting = signal(false);
    deletingIds = signal<Set<string>>(new Set());
    editingDepartmentId = signal<string | null>(null);
    displayedColumns = ['name', 'createdAt', 'actions'];
    form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
    });
    ngOnInit(): void {
        this.loadDepartments();
    }
    loadDepartments(): void {
        this.isLoading.set(true);
        this.departmentApi
            .getDepartments()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: (departments) => this.departments.set(departments),
            error: (error: HttpErrorResponse) => {
                this.snackBar.open(this.describeError(error, this.t('messages.departments.loadFailed')), this.t('common.close'), {
                    duration: 3500,
                });
            },
        });
    }
    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const name = this.form.controls.name.value.trim();
        const id = this.editingDepartmentId();
        const request$ = id
            ? this.departmentApi.updateDepartment(id, { name })
            : this.departmentApi.createDepartment({ name });
        this.isSubmitting.set(true);
        request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
            next: () => {
                this.snackBar.open(id ? this.t('messages.departments.updated') : this.t('messages.departments.created'), this.t('common.close'), {
                    duration: 2500,
                });
                this.cancelEdit();
                this.loadDepartments();
            },
            error: (error: HttpErrorResponse) => {
                this.snackBar.open(this.describeError(error, this.t('messages.departments.requestFailed')), this.t('common.close'), {
                    duration: 4000,
                });
            },
        });
    }
    startEdit(department: Department): void {
        this.editingDepartmentId.set(department.id);
        this.form.setValue({ name: (department.name ?? department.title ?? '').trim() });
    }
    cancelEdit(): void {
        this.editingDepartmentId.set(null);
        this.form.reset({ name: '' });
    }
    deleteDepartment(department: Department): void {
        const name = (department.name ?? department.title ?? 'this department').trim();
        const message = this.translate.instant('messages.departments.deleteConfirm', { name });
        this.dialog
            .open(ConfirmDialogComponent, {
            width: '420px',
            data: { message },
        })
            .afterClosed()
            .subscribe((confirmed: boolean) => {
            if (!confirmed)
                return;
            this.deletingIds.update((prev) => new Set(prev).add(department.id));
            this.departmentApi
                .deleteDepartment(department.id)
                .pipe(finalize(() => this.deletingIds.update((prev) => {
                const next = new Set(prev);
                next.delete(department.id);
                return next;
            })))
                .subscribe({
                next: () => {
                    this.snackBar.open(this.t('messages.departments.deleted'), this.t('common.close'), { duration: 2500 });
                    this.loadDepartments();
                },
                error: (error: HttpErrorResponse) => {
                    this.snackBar.open(this.describeError(error, this.t('messages.departments.deleteFailed')), this.t('common.close'), {
                        duration: 4000,
                    });
                },
            });
        });
    }
    isDeleting(id: string): boolean {
        return this.deletingIds().has(id);
    }
    displayDepartmentName(department: Department): string {
        return (department.name ?? department.title ?? '—').trim() || '—';
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
    private t(key: string): string {
        return this.translate.instant(key);
    }
}
