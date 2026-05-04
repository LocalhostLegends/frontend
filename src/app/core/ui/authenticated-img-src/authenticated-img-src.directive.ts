import {
    Directive,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { UserApiService } from '@app/core/api/user-api.service';

/** Loads image URL via HttpClient so AuthInterceptor attaches Bearer token (fixes 403 on protected avatar URLs). */
@Directive({
    selector: '[appAuthenticatedImgSrc]',
    standalone: true,
})
export class AuthenticatedImgSrcDirective implements OnChanges, OnDestroy {
    private readonly el = inject(ElementRef<HTMLImageElement>);
    private readonly userApi = inject(UserApiService);

    private blobObjectUrl: string | null = null;
    private fetchSub: Subscription | undefined;

    @Input({ alias: 'appAuthenticatedImgSrc' })
    appAuthenticatedImgSrc: string | null | undefined;

    /**
     * Load the profile `avatar` URL with auth instead of GET `/users/me/avatar`
     * (which may not be implemented on all backends). Use AuthInterceptor to attach Bearer token.
     */
    @Input({ alias: 'authMeAvatar' }) authMeAvatar = false;

    ngOnChanges(): void {
        this.fetchSub?.unsubscribe();
        this.revokeBlobUrl();
        const img = this.el.nativeElement;

        if (this.authMeAvatar) {
            const raw = (this.appAuthenticatedImgSrc ?? '').trim();
            if (!raw) {
                img.removeAttribute('src');
                return;
            }
            if (raw.startsWith('data:') || raw.startsWith('blob:')) {
                img.src = raw;
                return;
            }
            // Use the profile avatar URL with auth (no fallback to getMyAvatarBlob since that endpoint may not exist)
            this.fetchSub = this.userApi.getAuthenticatedBlob(raw).subscribe({
                next: (blob) => this.applyImageBlob(img, blob),
                error: () => {
                    img.removeAttribute('src');
                },
            });
            return;
        }

        const raw = (this.appAuthenticatedImgSrc ?? '').trim();
        if (!raw) {
            img.removeAttribute('src');
            return;
        }
        if (raw.startsWith('data:') || raw.startsWith('blob:')) {
            img.src = raw;
            return;
        }
        this.fetchSub = this.userApi.getAuthenticatedBlob(raw).subscribe({
            next: (blob) => this.applyImageBlob(img, blob),
            error: () => {
                img.removeAttribute('src');
            },
        });
    }

    private applyImageBlob(img: HTMLImageElement, blob: Blob): void {
        if (blob.type && !blob.type.startsWith('image/')) {
            img.removeAttribute('src');
            return;
        }
        this.revokeBlobUrl();
        this.blobObjectUrl = URL.createObjectURL(blob);
        img.src = this.blobObjectUrl;
    }

    ngOnDestroy(): void {
        this.fetchSub?.unsubscribe();
        this.revokeBlobUrl();
    }

    private revokeBlobUrl(): void {
        if (this.blobObjectUrl) {
            URL.revokeObjectURL(this.blobObjectUrl);
            this.blobObjectUrl = null;
        }
    }
}
