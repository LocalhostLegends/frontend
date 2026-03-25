import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    RouterLink,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
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
