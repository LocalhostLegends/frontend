import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.scss',
})
export class LandingHeaderComponent {
  public auth = inject(AuthService);
  private router = inject(Router);

  isAuth = computed(() => this.auth.isAuthenticated());
  userName = computed(() => {
    const user = this.auth.currentUser();
    return user ? `${user.firstname} ${user.lastname}` : '';
  });
  userRole = computed(() => this.auth.userRole());

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}