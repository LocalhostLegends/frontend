import { Component, inject, signal } from '@angular/core'; 
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    RouterModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  hidePassword = signal(true);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  errorMessage = signal<string | null>(null);
  onLogin() {
    const { email, password } = this.loginForm.getRawValue();

    this.authService.login(email, password).subscribe({
      next: () => {
        const user = this.authService.currentUser();

        if (!user) {
          this.router.navigate(['/app/dashboard']);
          return;
        }

        // console.log('User logged in successfully:', user);

        const role = user.role;
        if (role === 'hr') {
          this.router.navigate(['/app/dashboard']);
        } else if (role === 'employee' || role === 'admin') {
          this.router.navigate(['/app/dashboard-employee']);
        } else {
          this.router.navigate(['/app/dashboard-employee']);
        }
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Error during login');
        console.error('Login error:', err);
      },
    });
  }
}
