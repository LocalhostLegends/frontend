import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@app/core/services/language.service';
import { filter } from 'rxjs/operators';
@Component({
    selector: 'app-landing-header',
    standalone: true,
    imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, RouterLink, TranslatePipe],
    templateUrl: './landing-header.component.html',
    styleUrl: './landing-header.component.scss',
})
export class LandingHeaderComponent {
    private readonly router = inject(Router);
    private readonly languageService = inject(LanguageService);
    isMobileMenuOpen = signal(false);
    private readonly currentPath = signal(this.normalizePath(this.router.url));
    currentLanguage = this.languageService.currentLanguage;

    constructor() {
        this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
            this.currentPath.set(this.normalizePath(event.urlAfterRedirects));
            this.closeMobileMenu();
        });
    }

    isAuthPage(): boolean {
        const path = this.currentPath();
        return path.startsWith('/auth/') || path === '/activate' || path.startsWith('/invite-accept');
    }

    switchLanguage(language: 'en' | 'uk'): void {
        this.languageService.setLanguage(language);
    }

    toggleMobileMenu(): void {
        this.isMobileMenuOpen.update((v) => !v);
    }
    closeMobileMenu(): void {
        this.isMobileMenuOpen.set(false);
    }
    @HostListener('window:resize')
    onResize(): void {
        if (window.innerWidth > 900) {
            this.isMobileMenuOpen.set(false);
        }
    }

    private normalizePath(url: string): string {
        const withoutQuery = url.split('?')[0]?.split('#')[0] ?? '';
        const normalized = withoutQuery.trim();
        if (!normalized) {
            return '/';
        }
        return normalized.endsWith('/') && normalized.length > 1
            ? normalized.slice(0, -1)
            : normalized;
    }
}
