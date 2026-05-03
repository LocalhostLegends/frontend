import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog, } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { filter, finalize, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DepartmentApiService } from '@app/core/api/department-api.service';
import { PositionApiService } from '@app/core/api/position-api.service';
import { Department } from '@app/core/models/department.model';
import { Position } from '@app/core/models/position.model';
import { getDefaultInviteRole, getInvitableRoles, UserRole, } from '@app/core/constants/roles.constants';
import { AuthService } from '@app/core/services/auth.service';
import { InviteService } from './services/invite.service';
import { LoadingButtonComponent } from '@app/core/ui/loading-button/loading-button.component';
import { InviteSuccessDialogComponent } from './invite-success-dialog.component';
export interface InviteSetupWizardDialogData {
    presetRole?: UserRole;
}
@Component({
    selector: 'app-invite-setup-wizard-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatButtonToggleModule,
        LoadingButtonComponent,
    ],
    templateUrl: './invite-setup-wizard-dialog.component.html',
    styleUrls: ['./invite-setup-wizard-dialog.component.scss'],
})
export class InviteSetupWizardDialogComponent implements OnInit {
    private fb = inject(NonNullableFormBuilder);
    private departmentApi = inject(DepartmentApiService);
    private positionApi = inject(PositionApiService);
    private inviteService = inject(InviteService);
    private snackBar = inject(MatSnackBar);
    private dialogRef = inject(MatDialogRef<InviteSetupWizardDialogComponent>);
    private dialog = inject(MatDialog);
    readonly auth = inject(AuthService);
    private data = inject(MAT_DIALOG_DATA, { optional: true }) as InviteSetupWizardDialogData | undefined;
    readonly stepIndexes = [0, 1, 2];
    step = signal(0);
    invitableRoles = computed(() => getInvitableRoles(this.auth.userRole()));
    showRolePicker = computed(() => this.invitableRoles().length > 1);
    dialogTitle = computed(() => 'Send invite — setup');
    departments = signal<Department[]>([]);
    positions = signal<Position[]>([]);
    listsLoading = signal(true);
    deptMode = signal<'existing' | 'new'>('new');
    posMode = signal<'existing' | 'new'>('new');
    deptForm = this.fb.group({
        existingDepartmentId: [''],
        name: [''],
        description: [''],
    });
    posForm = this.fb.group({
        existingPositionId: [''],
        title: [''],
        description: [''],
    });
    inviteForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        role: ['employee' as UserRole, [Validators.required]],
    });
    createdDepartmentId = signal<string | null>(null);
    createdPositionId = signal<string | null>(null);
    deptSummaryName = signal('');
    posSummaryTitle = signal('');
    isDeptSubmitting = signal(false);
    isPosSubmitting = signal(false);
    isInviteSubmitting = signal(false);
    isBusy = computed(() => this.isDeptSubmitting() || this.isPosSubmitting() || this.isInviteSubmitting());
    stepCaption = computed(() => {
        switch (this.step()) {
            case 0:
                return 'Step 1: Department';
            case 1:
                return 'Step 2: Position';
            default:
                return 'Step 3: Invitation (email, role, links)';
        }
    });
    ngOnInit(): void {
        const allowed = this.invitableRoles();
        if (!allowed.length) {
            this.snackBar.open('Your role cannot send invites.', 'Close', { duration: 4000 });
            this.dialogRef.close();
            return;
        }
        let role: UserRole = getDefaultInviteRole(this.auth.userRole()) ?? allowed[0]!;
        const preset = this.data?.presetRole;
        if (preset && allowed.includes(preset)) {
            role = preset;
        }
        this.inviteForm.patchValue({ role });
        forkJoin({
            departments: this.departmentApi.getDepartments(),
            positions: this.positionApi.getPositions(),
        })
            .pipe(finalize(() => this.listsLoading.set(false)))
            .subscribe({
            next: ({ departments, positions }) => {
                this.departments.set(departments ?? []);
                this.positions.set(positions ?? []);
                this.deptMode.set((departments?.length ?? 0) > 0 ? 'existing' : 'new');
                this.posMode.set((positions?.length ?? 0) > 0 ? 'existing' : 'new');
                this.applyDeptValidators();
                this.applyPosValidators();
            },
            error: () => {
                this.snackBar.open('Could not load departments or positions. You can still create new ones.', 'Close', {
                    duration: 5000,
                });
                this.deptMode.set('new');
                this.posMode.set('new');
                this.applyDeptValidators();
                this.applyPosValidators();
            },
        });
    }
    departmentLabel(d: Department): string {
        const n = d.name?.trim();
        const t = d.title?.trim();
        return (n || t || d.id) ?? '';
    }
    positionLabel(p: Position): string {
        const n = p.name?.trim();
        const t = p.title?.trim();
        return (n || t || p.id) ?? '';
    }
    setDeptMode(mode: 'existing' | 'new'): void {
        this.deptMode.set(mode);
        this.deptForm.patchValue({ existingDepartmentId: '', name: '', description: '' });
        this.applyDeptValidators();
    }
    setPosMode(mode: 'existing' | 'new'): void {
        this.posMode.set(mode);
        this.posForm.patchValue({ existingPositionId: '', title: '', description: '' });
        this.applyPosValidators();
    }
    private applyDeptValidators(): void {
        const idCtrl = this.deptForm.controls.existingDepartmentId;
        const nameCtrl = this.deptForm.controls.name;
        const useExisting = this.deptMode() === 'existing' && this.departments().length > 0;
        if (useExisting) {
            idCtrl.setValidators([Validators.required]);
            nameCtrl.clearValidators();
        }
        else {
            idCtrl.clearValidators();
            nameCtrl.setValidators([Validators.required, Validators.minLength(2)]);
        }
        idCtrl.updateValueAndValidity({ emitEvent: false });
        nameCtrl.updateValueAndValidity({ emitEvent: false });
    }
    private applyPosValidators(): void {
        const idCtrl = this.posForm.controls.existingPositionId;
        const titleCtrl = this.posForm.controls.title;
        const useExisting = this.posMode() === 'existing' && this.positions().length > 0;
        if (useExisting) {
            idCtrl.setValidators([Validators.required]);
            titleCtrl.clearValidators();
        }
        else {
            idCtrl.clearValidators();
            titleCtrl.setValidators([Validators.required, Validators.minLength(2)]);
        }
        idCtrl.updateValueAndValidity({ emitEvent: false });
        titleCtrl.updateValueAndValidity({ emitEvent: false });
    }
    onCancel(): void {
        this.dialogRef.close();
    }
    onDeptNext(): void {
        if (this.deptForm.invalid) {
            this.deptForm.markAllAsTouched();
            return;
        }
        const useExisting = this.deptMode() === 'existing' && this.departments().length > 0;
        if (useExisting) {
            const id = this.deptForm.controls.existingDepartmentId.value?.trim();
            if (!id) {
                this.deptForm.markAllAsTouched();
                return;
            }
            const dept = this.departments().find((d) => d.id === id);
            this.createdDepartmentId.set(id);
            this.deptSummaryName.set(dept ? this.departmentLabel(dept) : id);
            this.step.set(1);
            return;
        }
        const raw = this.deptForm.getRawValue();
        const name = raw.name.trim();
        const description = raw.description.trim();
        this.isDeptSubmitting.set(true);
        this.departmentApi
            .createDepartment({
            name,
            ...(description ? { description } : {}),
        })
            .pipe(finalize(() => this.isDeptSubmitting.set(false)))
            .subscribe({
            next: (dept) => {
                const id = dept.id;
                if (!id) {
                    this.snackBar.open('Department created but no id returned', 'Close', { duration: 4000 });
                    return;
                }
                this.createdDepartmentId.set(id);
                this.deptSummaryName.set(name);
                this.step.set(1);
            },
            error: (err: HttpErrorResponse) => {
                this.snackBar.open(this.describeError(err, 'Failed to create department'), 'Close', {
                    duration: 5000,
                });
            },
        });
    }
    onPosNext(): void {
        if (this.posForm.invalid) {
            this.posForm.markAllAsTouched();
            return;
        }
        const useExisting = this.posMode() === 'existing' && this.positions().length > 0;
        if (useExisting) {
            const id = this.posForm.controls.existingPositionId.value?.trim();
            if (!id) {
                this.posForm.markAllAsTouched();
                return;
            }
            const pos = this.positions().find((p) => p.id === id);
            this.createdPositionId.set(id);
            this.posSummaryTitle.set(pos ? this.positionLabel(pos) : id);
            this.step.set(2);
            return;
        }
        const raw = this.posForm.getRawValue();
        const title = raw.title.trim();
        const description = raw.description.trim();
        this.isPosSubmitting.set(true);
        this.positionApi
            .createPosition({
            title,
            ...(description ? { description } : {}),
        })
            .pipe(finalize(() => this.isPosSubmitting.set(false)))
            .subscribe({
            next: (pos) => {
                const id = pos.id;
                if (!id) {
                    this.snackBar.open('Position created but no id returned', 'Close', { duration: 4000 });
                    return;
                }
                this.createdPositionId.set(id);
                this.posSummaryTitle.set(title);
                this.step.set(2);
            },
            error: (err: HttpErrorResponse) => {
                this.snackBar.open(this.describeError(err, 'Failed to create position'), 'Close', {
                    duration: 5000,
                });
            },
        });
    }
    onSendInvite(): void {
        if (this.inviteForm.invalid) {
            this.inviteForm.markAllAsTouched();
            return;
        }
        const deptId = this.createdDepartmentId();
        const posId = this.createdPositionId();
        if (!deptId || !posId) {
            this.snackBar.open('Missing department or position. Start over.', 'Close', { duration: 4000 });
            return;
        }
        const raw = this.inviteForm.getRawValue();
        const email = raw.email.trim();
        let role = raw.role as UserRole;
        const allowed = this.invitableRoles();
        if (!allowed.includes(role)) {
            role = allowed[0]!;
            this.inviteForm.patchValue({ role });
        }
        this.isInviteSubmitting.set(true);
        this.inviteService
            .createInvite(email, role, { departmentId: deptId, positionId: posId })
            .pipe(finalize(() => this.isInviteSubmitting.set(false)))
            .subscribe({
            next: () => {
                this.dialog
                    .open(InviteSuccessDialogComponent, {
                    width: '380px',
                    autoFocus: false,
                    disableClose: true,
                })
                    .afterClosed()
                    .pipe(filter(Boolean))
                    .subscribe(() => {
                    this.dialogRef.close('sent' as const);
                });
            },
            error: (err: HttpErrorResponse) => {
                this.snackBar.open(this.describeError(err, 'Failed to send invite'), 'Close', {
                    duration: 6000,
                });
            },
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
        }
        if (typeof payload === 'string' && payload.trim())
            return payload;
        return fallback;
    }
}
