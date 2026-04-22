import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public auth = inject(AuthService);
  private router = inject(Router);

  isAuth = computed(() => this.auth.isAuthenticated());
  companyName = computed(() => this.auth.currentUser()?.companyName ?? 'Company');
  userName = computed(() => {
    const user = this.auth.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });
  email = computed(() => this.auth.currentUser()?.email ?? '');

  avatarUrl = computed(() => {
    const user = this.auth.currentUser();
    return user && user.avatar ? user.avatar : 'assets/avatar.svg';
  });

  userRole = computed(() => this.auth.userRole());

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/']),
    });
  }

  goToProfile(): void {
    this.router.navigate(['/app/profile']);
  }

  goToSettings(): void {
    this.router.navigate(['/app/settings']);
  }
}
