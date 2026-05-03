import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../components/header/header.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { ShellLayoutService } from '../shell-layout.service';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, MatSidenavModule],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent {
  readonly layout = inject(ShellLayoutService);
}
