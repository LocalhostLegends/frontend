import { Component, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UserRole } from '../../../core/models/user.model';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  @ViewChild('successDialog') successDialog!: TemplateRef<unknown>;

  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  dialogRef: MatDialogRef<unknown> | null = null;
  roles: Exclude<UserRole, null>[] = ['admin', 'hr', 'employee'];

  registerForm = this.fb.group(
    {
      companyName: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { companyName, firstName, lastName, email, password } = this.registerForm.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .register(companyName, firstName, lastName, email, password)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.dialogRef = this.dialog.open(this.successDialog, {
            width: '380px',
            disableClose: true,
          });

          this.dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/auth/login']);
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(error?.error?.message || 'Error during registration');
        },
      });
  }

  closeDialog() {
    this.dialogRef?.close();
  }
}
