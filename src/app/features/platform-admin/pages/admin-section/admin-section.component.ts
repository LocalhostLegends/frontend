import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
@Component({
    selector: 'app-platform-admin-section',
    standalone: true,
    imports: [MatButtonModule, RouterLink],
    templateUrl: './admin-section.component.html',
    styleUrls: ['./admin-section.component.scss'],
})
export class PlatformAdminSectionComponent {
    private route = inject(ActivatedRoute);
    readonly title = (this.route.snapshot.data['title'] as string) || 'Admin';
    readonly subtitle = (this.route.snapshot.data['subtitle'] as string) ||
        'This section will be available in a future update.';
}
