import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public auth = inject(AuthService);
  private router = inject(Router);
  searchQuery = '';

  isAuth = computed(() => this.auth.isAuthenticated());
  companyName = computed(() => {
    const value = this.auth.currentUser()?.companyName?.trim();
    return value ? value : 'Company Name';
  });
  userName = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return '';
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return fullName || user.email || 'User';
  });

  avatarUrl = computed(() => {
    const user = this.auth.currentUser();
    return user?.avatar ?? '';
  });

  avatarText = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return 'U';
    const first = user.firstName?.trim()?.[0] ?? '';
    const last = user.lastName?.trim()?.[0] ?? '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || user.email?.trim()?.[0]?.toUpperCase() || 'U';
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

  submitSearch(): void {
    const query = this.searchQuery.trim();
    this.router.navigate(['/app/dashboard'], {
      queryParams: query ? { search: query } : {},
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.submitSearch();
  }
}
