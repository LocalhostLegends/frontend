import { Component, inject, signal } from '@angular/core'; // Добавили signal
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Добавили иконки
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

  // Signal для скрытия пароля
  hidePassword = signal(true);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  errorMessage = signal<string | null>(null);
onLogin() {
  if (this.loginForm.valid) {
    const { email, password } = this.loginForm.getRawValue();
    const success = this.authService.login(email, password);

    if (success) {
      this.errorMessage.set(null);

      // 1. Получаем роль (вызываем сигнал как функцию)
      const role = this.authService.userRole(); 
      console.log('Login success! User role is:', role);

      // 2. Определяем ОДИН правильный путь
      const targetUrl = role === 'employee' 
        ? '/app/dashboard-employee' 
        : '/app/dashboard';

      console.log('Navigating to:', targetUrl);

      // 3. Выполняем переход
      this.router.navigate([targetUrl]);

    } else {
      this.errorMessage.set('Invalid email or password');
    }
  }
}

}
