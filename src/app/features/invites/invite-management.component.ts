import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { InviteService } from './services/invite.service';
import { Invite } from '../../core/models/invite.model';
import { Department } from '../../core/models/department.model';
import { Position } from '../../core/models/position.model';
import { DepartmentApiService } from '../../core/api/department-api.service';
import { PositionApiService } from '../../core/api/position-api.service';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingButtonComponent } from '../../core/ui/loading-button/loading-button.component';

@Component({
  selector: 'app-invite-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    MatSelectModule,
    LoadingButtonComponent,
  ],
  templateUrl: './invite-management.component.html',
  styleUrls: ['./invite-management.component.scss'],
})
export class InviteManagementComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private inviteService = inject(InviteService);
  private departmentApi = inject(DepartmentApiService);
  private positionApi = inject(PositionApiService);
  private snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  invites = signal<Invite[]>([]);
  departments = signal<Department[]>([]);
  positions = signal<Position[]>([]);
  isLoading = signal(false);
  isMetaLoading = signal(false);
  isCreating = signal(false);
  resendingIds = signal<Set<string>>(new Set());
  cancellingIds = signal<Set<string>>(new Set());

  userRole = computed(() => this.auth.userRole());
  shouldUseDepartmentAndPosition = computed(() => this.userRole() === 'hr');

  displayedColumns: string[] = ['email', 'role', 'status', 'createdAt', 'actions'];

  /** POST /invites — departmentId / positionId з GET /departments та GET /positions. */
  createForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    departmentId: [''],
    positionId: [''],
  });

  ngOnInit() {
    this.configureFormByRole();
    this.loadInvites();
    if (this.shouldUseDepartmentAndPosition()) {
      this.loadDepartmentsAndPositions();
    }
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

  private loadDepartmentsAndPositions() {
    this.isMetaLoading.set(true);
    forkJoin({
      departments: this.departmentApi.getDepartments(),
      positions: this.positionApi.getPositions(),
    })
      .pipe(finalize(() => this.isMetaLoading.set(false)))
      .subscribe({
        next: ({ departments, positions }) => {
          this.departments.set(departments);
          this.positions.set(positions);
        },
        error: () => {
          this.snackBar.open('Failed to load departments or positions', 'Close', { duration: 5000 });
        },
      });
  }

  private configureFormByRole() {
    const departmentControl = this.createForm.controls.departmentId;
    const positionControl = this.createForm.controls.positionId;

    if (this.shouldUseDepartmentAndPosition()) {
      departmentControl.setValidators([Validators.required]);
      positionControl.setValidators([Validators.required]);
      departmentControl.updateValueAndValidity({ emitEvent: false });
      positionControl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    departmentControl.clearValidators();
    positionControl.clearValidators();
    departmentControl.setValue('', { emitEvent: false });
    positionControl.setValue('', { emitEvent: false });
    departmentControl.updateValueAndValidity({ emitEvent: false });
    positionControl.updateValueAndValidity({ emitEvent: false });
  }

  loadInvites() {
    this.isLoading.set(true);

    this.inviteService
      .getCompanyInvites()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (invites: Invite[]) => {
          this.invites.set(invites);
        },
        error: () => {
          this.snackBar.open('Error loading invites', 'Close', { duration: 3000 });
        },
      });
  }

  onCreateInvite() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const raw = this.createForm.getRawValue();
    const email = raw.email.trim();
    const role = this.auth.userRole() === 'admin' ? 'hr' : this.auth.userRole() === 'hr' ? 'employee' : null;
    const options = this.shouldUseDepartmentAndPosition()
      ? {
          departmentId: raw.departmentId.trim(),
          positionId: raw.positionId.trim(),
        }
      : undefined;

    const invite$ = role ? this.inviteService.createInvite(email, role, options) : null;

    if (!invite$) {
      this.snackBar.open('Access denied', 'Close', { duration: 3000 });
      return;
    }

    this.isCreating.set(true);
    invite$.pipe(finalize(() => this.isCreating.set(false))).subscribe({
      next: () => {
        this.snackBar.open('Invite created. Check your email inbox/spam.', 'Close', {
          duration: 4000,
        });
        this.createForm.reset();
        this.loadInvites();
      },
      error: (err: HttpErrorResponse) => {
        const e = err.error as Record<string, unknown> | string | undefined;
        let message = `Помилка ${err.status}`;
        if (e && typeof e === 'object') {
          const m = e['message'];
          if (typeof m === 'string') message = m;
          else if (Array.isArray(m)) message = m.map(String).join('; ');
          else if (typeof e['error'] === 'string') message = e['error'];
        } else if (typeof e === 'string' && e) {
          message = e;
        }
        if (err.status === 500 && message === 'Internal server error') {
          message += '. Please check your department and position and try again..';
        }
        this.snackBar.open(message, 'Close', { duration: 10000 });
      },
    });
  }

  onResendInvite(invite: Invite) {
    if (this.isResending(invite.id) || this.isCancelling(invite.id)) return;

    this.resendingIds.update((ids) => new Set(ids).add(invite.id));
    this.inviteService
      .resendInvite(invite.id)
      .pipe(
        finalize(() =>
          this.resendingIds.update((ids) => {
            const next = new Set(ids);
            next.delete(invite.id);
            return next;
          }),
        ),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Invite resent successfully', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Error resending invite', 'Close', { duration: 3000 });
        },
      });
  }

  onCancelInvite(invite: Invite) {
    if (this.isCancelling(invite.id) || this.isResending(invite.id)) return;

    const confirmed = confirm(`Are you sure you want to cancel the invite for ${invite.email}?`);
    if (!confirmed) return;

    this.cancellingIds.update((ids) => new Set(ids).add(invite.id));
    this.inviteService
      .cancelInvite(invite.id)
      .pipe(
        finalize(() =>
          this.cancellingIds.update((ids) => {
            const next = new Set(ids);
            next.delete(invite.id);
            return next;
          }),
        ),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Invite cancelled successfully', 'Close', { duration: 3000 });
          this.loadInvites();
        },
        error: () => {
          this.snackBar.open('Error cancelling invite', 'Close', { duration: 3000 });
        },
      });
  }

  getInviteDisplayDate(invite: Invite): string | null {
    return invite.createdAt || invite.acceptedAt || invite.expiresAt || null;
  }

  isResending(id: string): boolean {
    return this.resendingIds().has(id);
  }

  isCancelling(id: string): boolean {
    return this.cancellingIds().has(id);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'accepted':
        return 'green';
      case 'expired':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'black';
    }
  }
}
