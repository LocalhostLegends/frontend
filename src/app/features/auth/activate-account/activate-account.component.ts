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
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';
import { LoadingButtonComponent } from '../../../core/ui/loading-button/loading-button.component';

/**
 * Лист із посиланням /activate?token=… після створення HR/Employee на бекенді.
 * Без GET /invites/validate — токен активації обробляє лише POST /auth/activate.
 */
@Component({
  selector: 'app-activate-account',
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
    LoadingButtonComponent,
  ],
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss'],
})
export class ActivateAccountComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  token = signal('');
  isSubmitting = signal(false);
  isInvalid = signal(false);

  form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  ngOnInit() {
    const t = this.route.snapshot.queryParams['token'] ?? '';
    this.token.set(t);
    if (!t) {
      this.isInvalid.set(true);
    }
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.form.invalid || !this.token()) {
      this.form.markAllAsTouched();
      return;
    }

    const { password } = this.form.getRawValue();
    this.isSubmitting.set(true);

    this.authService
      .activate(this.token(), password)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Account activated. Redirecting to dashboard…', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/app/dashboard']);
        },
        error: () => {
          this.snackBar.open('Activation failed. Check the link or request a new invite.', 'Close', { duration: 5000 });
        },
      });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
