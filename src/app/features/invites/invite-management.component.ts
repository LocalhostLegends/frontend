import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InviteService } from '../../services/invite.service';
import { Invite } from '../../models/invite.model';
import { finalize } from 'rxjs';

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
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './invite-management.component.html',
  styleUrls: ['./invite-management.component.scss'],
})
export class InviteManagementComponent {
  private fb = inject(NonNullableFormBuilder);
  private inviteService = inject(InviteService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  invites = signal<Invite[]>([]);
  isLoading = signal(false);
  isCreating = signal(false);

  displayedColumns: string[] = ['email', 'role', 'status', 'createdAt', 'actions'];

  createForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['employee' as 'hr' | 'employee', Validators.required],
  });

  ngOnInit() {
    this.loadInvites();
  }

  loadInvites() {
    this.isLoading.set(true);
    this.inviteService
      .getCompanyInvites()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (invites: Invite[]) => this.invites.set(invites),
        error: (err) => {
          console.error('Error loading invites:', err);
          this.snackBar.open('Error loading invites', 'Close', { duration: 3000 });
        },
      });
  }

  onCreateInvite() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const { email, role } = this.createForm.getRawValue();

    this.isCreating.set(true);
    this.inviteService
      .createInvite(email, role)
      .pipe(finalize(() => this.isCreating.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Invite sent successfully', 'Close', { duration: 3000 });
          this.createForm.reset({ role: 'employee' });
          this.loadInvites();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error creating invite:', err);
          this.snackBar.open('Error creating invite', 'Close', { duration: 3000 });
        },
      });
  }

  onResendInvite(invite: Invite) {
    this.inviteService.resendInvite(invite.id).subscribe({
      next: () => {
        this.snackBar.open('Invite resent successfully', 'Close', { duration: 3000 });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error resending invite:', err);
        this.snackBar.open('Error resending invite', 'Close', { duration: 3000 });
      },
    });
  }

  onCancelInvite(invite: Invite) {
    const confirmed = confirm(`Are you sure you want to cancel the invite for ${invite.email}?`);
    if (!confirmed) return;

    this.inviteService.cancelInvite(invite.id).subscribe({
      next: () => {
        this.snackBar.open('Invite cancelled successfully', 'Close', { duration: 3000 });
        this.loadInvites();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error cancelling invite:', err);
        this.snackBar.open('Error cancelling invite', 'Close', { duration: 3000 });
      },
    });
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
