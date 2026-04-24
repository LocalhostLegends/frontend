import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';

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
    const items: MenuItem[] = [];

    if (role === 'admin') {
      items.push(
        { label: 'Dashboard', icon: 'dashboard.svg', route: '/app/dashboard', exact: true },
        { label: 'Employees', icon: 'people.svg', route: '/app/employees', exact: false },
        { label: 'Departments', icon: 'folder.svg', route: '/app/departments', exact: false },
        { label: 'Payroll', icon: 'payroll.svg', route: '/app/payroll', exact: false },
        { label: 'Analytics', icon: 'analytics.svg', route: '/app/analytics', exact: false },
        { label: 'Recruitment', icon: 'recruitment.svg', route: '/app/recruitment', exact: false },
        { label: 'Settings', icon: 'settings.svg', route: '/app/settings', exact: false },
      );
    } else if (role === 'hr') {
      items.push(
        { label: 'Dashboard', icon: 'dashboard.svg', route: '/app/dashboard', exact: true },
        { label: 'Employees', icon: 'people.svg', route: '/app/employees', exact: false },
        { label: 'Departments', icon: 'folder.svg', route: '/app/departments', exact: false },
        {
          label: 'Time Off Requests',
          icon: 'time.svg',
          route: '/app/time-off-requests',
          exact: false,
        },
        { label: 'Candidates', icon: 'people.svg', route: '/app/candidates', exact: false },
        { label: 'Onboarding', icon: 'onboarding.svg', route: '/app/onboarding', exact: false },
      );
    } else if (role === 'employee') {
      items.push(
        { label: 'My Profile', icon: 'profile.svg', route: '/app/profile', exact: false },
        { label: 'My Requests', icon: 'requests.svg', route: '/app/my-requests', exact: false },
        { label: 'Company Info', icon: 'info.svg', route: '/app/company-info', exact: false },
        { label: 'My Time Off', icon: 'time.svg', route: '/app/my-time-off', exact: false },
        { label: 'Learning', icon: 'learning.svg', route: '/app/learning', exact: false },
        { label: 'Team', icon: 'team.svg', route: '/app/team', exact: false },
      );
    }

    return items;
  });

  onToggleClick() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
