import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthApiService } from '@app/core/api/auth-api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoadingButtonComponent } from '@app/core/ui/loading-button/loading-button.component';
@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [RouterLink, TranslatePipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, LoadingButtonComponent],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss',
})



export class ForgotPasswordComponent {
  private authApi = inject(AuthApiService);
  
  emailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email]
  });

  isLoading = signal(false);
  isSent = signal(false); // Чтобы показать сообщение об успехе

  onSubmit() {
    if (this.emailControl.invalid) return;

    this.isLoading.set(true);
    this.authApi.forgotPassword(this.emailControl.value).subscribe({
      next: () => {
        this.isSent.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading.set(false);
        // Тут можно добавить алерт с ошибкой
      }
    });
  }
}