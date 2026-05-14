import { Component, inject, signal, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApiService } from '@app/core/api/auth-api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoadingButtonComponent } from '@app/core/ui/loading-button/loading-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    LoadingButtonComponent,
    TranslateModule,
    RouterLink,
    MatIconModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authApi = inject(AuthApiService);
  private router = inject(Router);

  token = signal<string | null>(null);
  isLoading = signal(false);
  isSuccess = signal(false);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  errorMessage = signal<string | null>(null);
  resetForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    // Достаем токен из query параметров: /reset-password?token=XYZ
    this.token.set(this.route.snapshot.queryParamMap.get('token'));

    if (!this.token()) {
      // Если токена нет, можно редиректнуть на логин
      this.router.navigate(['/auth/login']);
    }
  }

 onSubmit() {
  const token = this.token();
  const password = this.resetForm.value.password;

  if (this.resetForm.invalid || !token || !password) return;

  this.isLoading.set(true);
  this.errorMessage.set(null); // Сбрасываем старую ошибку перед новым запросом

  this.authApi.resetPassword({ token, newPassword: password }).subscribe({
    next: () => {
      this.isSuccess.set(true);
      this.isLoading.set(false);
      // Через 3 секунды перекидываем на логин
      setTimeout(() => this.router.navigate(['/auth/login']), 3000);
    },
    error: (err) => {
      this.isLoading.set(false);

      // Проверяем код ошибки от бэкенда
      if (err.error?.code === 'AUTH_5009') {
        this.errorMessage.set('auth.errors.tokenUsed'); 
      } else {
        this.errorMessage.set('auth.errors.generic'); 
      }
    }
  });
}
}