import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'en' | 'uk';

@Injectable({
    providedIn: 'root',
})
export class LanguageService {
    private readonly storageKey = 'app-language';
    readonly currentLanguage = signal<AppLanguage>('en');

    constructor(private readonly translate: TranslateService) {}

    initialize(): void {
        const saved = localStorage.getItem(this.storageKey);
        const lang: AppLanguage = saved === 'uk' ? 'uk' : 'en';

        this.translate.setFallbackLang('en');
        this.translate.use(lang);
        this.currentLanguage.set(lang);
    }

    setLanguage(language: AppLanguage): void {
        this.translate.use(language);
        this.currentLanguage.set(language);
        localStorage.setItem(this.storageKey, language);
    }
}
