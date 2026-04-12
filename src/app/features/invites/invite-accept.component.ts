import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { InviteService } from '../../services/invite.service';
import { ValidateInviteResponse, AcceptInviteResponse } from '../../services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-invite-accept',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './invite-accept.component.html',
  styleUrls: ['./invite-accept.component.scss'],
})
export class InviteAcceptComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inviteService = inject(InviteService);
  private snackBar = inject(MatSnackBar);

  token = signal<string>('');
  inviteData = signal<ValidateInviteResponse | null>(null);
  isValidating = signal(true);
  isAccepting = signal(false);
  isInvalid = signal(false);

  acceptForm = this.fb.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  ngOnInit() {
    this.token.set(this.route.snapshot.queryParams['token'] || '');

    if (!this.token()) {
      this.isValidating.set(false);
      this.isInvalid.set(true);
      return;
    }

    this.validateInvite();
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  validateInvite() {
    this.inviteService
      .validateInvite(this.token())
      .pipe(finalize(() => this.isValidating.set(false)))
      .subscribe({
        next: (response: ValidateInviteResponse) => {
          if (response.valid && response.invite) {
            this.inviteData.set(response);
          } else {
            this.isInvalid.set(true);
          }
        },
        error: (err) => {
          console.error('Error validating invite:', err);
          this.isInvalid.set(true);
        },
      });
  }

  onAcceptInvite() {
    if (this.acceptForm.invalid) {
      this.acceptForm.markAllAsTouched();
      return;
    }

    const { firstName, lastName, password } = this.acceptForm.getRawValue();

    this.isAccepting.set(true);
    this.inviteService
      .acceptInvite(this.token(), firstName, lastName, password)
      .pipe(finalize(() => this.isAccepting.set(false)))
      .subscribe({
        next: (response: AcceptInviteResponse) => {
          if (response.success) {
            this.snackBar.open('Account created successfully! Please login.', 'Close', {
              duration: 5000,
            });
            this.router.navigate(['/auth/login']);
          } else {
            this.snackBar.open(response.message || 'Error accepting invite', 'Close', {
              duration: 3000,
            });
          }
        },
        error: (err) => {
          console.error('Error accepting invite:', err);
          this.snackBar.open('Error accepting invite', 'Close', { duration: 3000 });
        },
      });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
