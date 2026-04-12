import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  exact: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatButtonModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  private authService = inject(AuthService);

  isSidebarCollapsed = false;

  menuItems = computed(() => {
    const role = this.authService.userRole();
    const baseItems: MenuItem[] = [];

    if (role === 'employee') {
      baseItems.push({
        label: 'Dashboard',
        icon: 'dashboard.svg',
        route: '/app/dashboard-employee',
        exact: true,
      });
    } else {
      baseItems.push({
        label: 'Dashboard',
        icon: 'dashboard.svg',
        route: '/app/dashboard',
        exact: true,
      });
    }

    if (role === 'admin' || role === 'hr') {
      baseItems.push(
        { label: 'Projects', icon: 'folder.svg', route: '/app/projects', exact: false },
        { label: 'Users', icon: 'people.svg', route: '/app/users', exact: false },
        { label: 'Invites', icon: 'people.svg', route: '/app/invites', exact: false },
        { label: 'Settings', icon: 'settings.svg', route: '/app/settings', exact: false },
      );
    }

    return baseItems;
  });

  onToggleClick() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
