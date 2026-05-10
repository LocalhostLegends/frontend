import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators, AbstractControl, ValidationErrors, } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@app/core/services/auth.service';
import { finalize } from 'rxjs';
import { LoadingButtonComponent } from '@app/core/ui/loading-button/loading-button.component';
import { HttpErrorResponse } from '@angular/common/http';
import { isUuidLike, normalizeInviteToken } from '@app/core/utils/invite-token';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { InviteApiService } from '@app/core/api/invite-api.service';
@Component({
    selector: 'app-activate-account',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        LoadingButtonComponent,
        TranslatePipe,
    ],
    templateUrl: './activate-account.component.html',
    styleUrls: ['./activate-account.component.scss'],
})
export class ActivateAccountComponent implements OnInit {
    private fb = inject(NonNullableFormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);
    private inviteApi = inject(InviteApiService);
    private snackBar = inject(MatSnackBar);
    private destroyRef = inject(DestroyRef);
    private translate = inject(TranslateService);
    token = signal('');
    isSubmitting = signal(false);
    hidePassword = signal(true);
    hideConfirmPassword = signal(true);
    isInvalid = signal(false);
    tokenNotUuid = signal(false);
    isCheckingInvite = signal(false);
    inviteValidated = signal(false);
    inviteEmail = signal('');
    showSuccessModal = signal(false);
    form = this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(1)]],
        lastName: ['', [Validators.required, Validators.minLength(1)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
    ngOnInit() {
        const applyParams = (params: ParamMap) => {
            let t = params.get('token') ??
                params.get('inviteToken') ??
                params.get('t') ??
                params.get('code') ??
                '';
            if (!t.trim()) {
                const fragment = this.route.snapshot.fragment;
                if (fragment) {
                    try {
                        const fragParams = new URLSearchParams(fragment);
                        t =
                            fragParams.get('token') ??
                                fragParams.get('inviteToken') ??
                                fragParams.get('access_token') ??
                                '';
                    }
                    catch {
                    }
                }
            }
            if (!t.trim()) {
                t = this.extractTokenFromCurrentLocation();
            }
            t = normalizeInviteToken(t);
            this.token.set(t);
            this.isInvalid.set(!t);
            this.tokenNotUuid.set(!!t && !isUuidLike(t));
            this.inviteValidated.set(false);
            this.inviteEmail.set('');
            if (t && isUuidLike(t)) {
                this.validateInviteBeforeActivation(t);
            }
        };
        applyParams(this.route.snapshot.queryParamMap);
        this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(applyParams);
    }
    private validateInviteBeforeActivation(token: string): void {
        this.isCheckingInvite.set(true);
        this.inviteApi.validateInvite(token).pipe(finalize(() => this.isCheckingInvite.set(false))).subscribe({
            next: (response: unknown) => {
                if (this.isPendingInvite(response)) {
                    this.inviteEmail.set(this.extractInviteEmail(response));
                    this.inviteValidated.set(true);
                    return;
                }
                this.isInvalid.set(true);
            },
            error: (err: unknown) => {
                if (this.isInviteAlreadyAcceptedError(err)) {
                    this.snackBar.open(this.t('messages.activate.inviteAlreadyAccepted'), this.t('common.close'), { duration: 4500 });
                    void this.router.navigate(['/auth/login']);
                    return;
                }
                this.isInvalid.set(true);
            },
        });
    }
    private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { mismatch: true };
    }
    onSubmit() {
        if (this.form.invalid || !this.token()) {
            this.form.markAllAsTouched();
            return;
        }
        const { password, firstName, lastName } = this.form.getRawValue();
        this.isSubmitting.set(true);
        const rawToken = this.token();
        const token = normalizeInviteToken(rawToken);
        if (token !== rawToken) {
            this.token.set(token);
        }
        this.authService
            .acceptInvite(token, firstName.trim(), lastName.trim(), password, this.inviteEmail())
            .pipe(finalize(() => this.isSubmitting.set(false)))
            .subscribe({
            next: () => {
                this.showSuccessModal.set(true);
                setTimeout(() => this.navigateToDashboard(), 1400);
            },
            error: (err: unknown) => {
                const msg = this.apiErrorMessage(err);
                this.snackBar.open(msg ?? this.t('messages.activate.failed'), this.t('common.close'), { duration: 6000 });
                if (this.isInviteAlreadyAcceptedError(err)) {
                    void this.router.navigate(['/auth/login']);
                }
            },
        });
    }
    goToLogin() {
        this.router.navigate(['/auth/login']);
    }
    private apiErrorMessage(err: unknown): string | null {
        if (!(err instanceof HttpErrorResponse) || !err.error) {
            return null;
        }
        const body = err.error as {
            message?: string | string[];
            code?: string;
        };
        if (body.code === 'INV_4009') {
            return this.t('messages.activate.inviteAlreadyAccepted');
        }
        const m = body.message;
        if (Array.isArray(m) && m.length > 0 && typeof m[0] === 'string') {
            return m[0];
        }
        if (typeof m === 'string') {
            return m;
        }
        return null;
    }
    private isInviteAlreadyAcceptedError(err: unknown): boolean {
        if (!(err instanceof HttpErrorResponse) || !err.error) {
            return false;
        }
        const body = err.error as { code?: string };
        return body.code === 'INV_4009';
    }
    private isPendingInvite(response: unknown): boolean {
        if (!response || typeof response !== 'object') {
            return false;
        }
        const root = response as Record<string, unknown>;
        if (root['valid'] === true) {
            return true;
        }
        if (typeof root['status'] === 'string') {
            return root['status'].toLowerCase() === 'pending';
        }
        const data =
            root['data'] && typeof root['data'] === 'object'
                ? (root['data'] as Record<string, unknown>)
                : null;
        if (data && typeof data['status'] === 'string') {
            return data['status'].toLowerCase() === 'pending';
        }
        return false;
    }
    private extractInviteEmail(response: unknown): string {
        if (!response || typeof response !== 'object') {
            return '';
        }
        const root = response as Record<string, unknown>;
        const invite = root['invite'] && typeof root['invite'] === 'object'
            ? (root['invite'] as Record<string, unknown>)
            : null;
        if (invite && typeof invite['email'] === 'string') {
            return invite['email'].trim();
        }
        const data = root['data'] && typeof root['data'] === 'object'
            ? (root['data'] as Record<string, unknown>)
            : null;
        if (data && typeof data['email'] === 'string') {
            return data['email'].trim();
        }
        return '';
    }
    private navigateToDashboard(): void {
        void this.router.navigateByUrl('/app/dashboard', { replaceUrl: true }).then((ok) => {
            if (!ok) {
                this.snackBar.open(this.t('messages.activate.openAppFailed'), this.t('common.close'), { duration: 6500 });
                void this.router.navigate(['/auth/login']);
            }
        });
    }
    private extractTokenFromCurrentLocation(): string {
        if (typeof window === 'undefined' || !window.location) {
            return '';
        }
        const href = window.location.href ?? '';
        if (!href.trim()) {
            return '';
        }
        const normalizedHref = normalizeInviteToken(href);
        if (isUuidLike(normalizedHref)) {
            return normalizedHref;
        }
        try {
            const url = new URL(href);
            const fromQuery = url.searchParams.get('token') ??
                url.searchParams.get('inviteToken') ??
                url.searchParams.get('t') ??
                url.searchParams.get('code') ??
                '';
            if (fromQuery.trim()) {
                return fromQuery;
            }
            const hash = (url.hash || '').replace(/^#/, '');
            if (hash.trim()) {
                const hashParams = new URLSearchParams(hash);
                const fromHash = hashParams.get('token') ??
                    hashParams.get('inviteToken') ??
                    hashParams.get('t') ??
                    hashParams.get('code') ??
                    hashParams.get('access_token') ??
                    '';
                if (fromHash.trim()) {
                    return fromHash;
                }
            }
        }
        catch {
        }
        return '';
    }
    private t(key: string): string {
        return this.translate.instant(key);
    }
}
