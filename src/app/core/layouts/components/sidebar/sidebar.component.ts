import { Component, HostBinding, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '@app/core/services/auth.service';
import { getMenuItemsByRole } from '@app/core/constants/menu.constants';
import { ShellLayoutService } from '@app/core/layouts/shell-layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  private authService = inject(AuthService);
  readonly shell = inject(ShellLayoutService);

  isCollapsed = signal(false);

  menuItems = computed(() => {
    const role = this.authService.userRole();
    return getMenuItemsByRole(role);
  });

  @HostBinding('style.width.px')
  get hostDrawerWidth(): number {
    if (this.shell.isMobile()) {
      return 256;
    }
    return this.isCollapsed() ? 72 : 216;
  }

  onToggleClick(): void {
    this.isCollapsed.update((v) => !v);
  }

  onNavigate(): void {
    this.shell.closeSidenavIfMobile();
  }
}
