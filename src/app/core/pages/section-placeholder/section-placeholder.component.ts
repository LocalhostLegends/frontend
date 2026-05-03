import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
@Component({
    selector: 'app-section-placeholder',
    standalone: true,
    imports: [MatButtonModule, RouterLink],
    template: `
    <section class="wrap">
      <h1>{{ title }}</h1>
      <p class="muted">{{ subtitle }}</p>
      <a mat-stroked-button routerLink="/app/dashboard">Back to Dashboard</a>
    </section>
  `,
    styles: [
        `
      .wrap {
        padding: 2rem;
        max-width: 42rem;
      }
      h1 {
        margin: 0 0 0.75rem;
        font-size: 1.5rem;
        font-weight: 600;
      }
      .muted {
        margin: 0 0 1.5rem;
        color: rgba(0, 0, 0, 0.6);
        line-height: 1.5;
      }
    `,
    ],
})
export class SectionPlaceholderComponent {
    private route = inject(ActivatedRoute);
    readonly title = (this.route.snapshot.data['title'] as string) || 'Section';
    readonly subtitle = (this.route.snapshot.data['subtitle'] as string) ||
        'This section will be available in a future update.';
}
