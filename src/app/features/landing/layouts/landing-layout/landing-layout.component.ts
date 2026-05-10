import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LandingHeaderComponent } from '@app/features/landing/components/landing-header/landing-header.component';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
    selector: 'app-landing-layout',
    standalone: true,
    imports: [RouterOutlet, LandingHeaderComponent, TranslatePipe],
    templateUrl: './landing-layout.component.html',
    styleUrl: './landing-layout.component.scss',
})
export class LandingLayoutComponent {
}
