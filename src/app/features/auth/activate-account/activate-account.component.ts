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
    ],
    templateUrl: './activate-account.component.html',
    styleUrls: ['./activate-account.component.scss'],
})
export class ActivateAccountComponent implements OnInit {
    private fb = inject(NonNullableFormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);
    private snackBar = inject(MatSnackBar);
    private destroyRef = inject(DestroyRef);
    token = signal('');
    isSubmitting = signal(false);
    hidePassword = signal(true);
    hideConfirmPassword = signal(true);
    isInvalid = signal(false);
    tokenNotUuid = signal(false);
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
            t = normalizeInviteToken(t);
            this.token.set(t);
            this.isInvalid.set(!t);
            this.tokenNotUuid.set(!!t && !isUuidLike(t));
        };
        applyParams(this.route.snapshot.queryParamMap);
        this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(applyParams);
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
            .acceptInvite(token, firstName.trim(), lastName.trim(), password)
            .pipe(finalize(() => this.isSubmitting.set(false)))
            .subscribe({
            next: () => {
                this.snackBar.open('Account activated. Redirecting to dashboard…', 'Close', {
                    duration: 3000,
                });
                queueMicrotask(() => {
                    void this.router.navigateByUrl('/app/dashboard', { replaceUrl: true }).then((ok) => {
                        if (!ok) {
                            this.snackBar.open('Could not open the app. Please sign in with your new password.', 'Close', { duration: 6500 });
                            void this.router.navigate(['/auth/login']);
                        }
                    });
                });
            },
            error: (err: unknown) => {
                const msg = this.apiErrorMessage(err);
                this.snackBar.open(msg ?? 'Activation failed. Check the link or request a new invite.', 'Close', { duration: 6000 });
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
        };
        const m = body.message;
        if (Array.isArray(m) && m.length > 0 && typeof m[0] === 'string') {
            return m[0];
        }
        if (typeof m === 'string') {
            return m;
        }
        return null;
    }
}
