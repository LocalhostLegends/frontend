import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { UserApiService } from '@app/core/api/user-api.service';
import { User } from '@app/core/models/user.model';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '@app/core/ui/loading-button/loading-button.component';
import { AuthenticatedImgSrcDirective } from '@app/core/ui/authenticated-img-src/authenticated-img-src.directive';
import { PendingChangesAware } from '@app/core/guards/pending-changes.guard';
import { AuthService } from '@app/core/services/auth.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmDialogComponent } from '@app/core/ui/confirm-dialog/confirm-dialog.component';
const PHONE_ALLOWED_PATTERN = /^\+[0-9 ()-]*$/;
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 12;
const NAME_MIN_LENGTH = 2;
@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        LoadingButtonComponent,
        AuthenticatedImgSrcDirective,
        TranslatePipe,
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, PendingChangesAware {
    private userApi = inject(UserApiService);
    private fb = inject(FormBuilder);
    private snackBar = inject(MatSnackBar);
    private dialog = inject(MatDialog);
    private auth = inject(AuthService);
    private translate = inject(TranslateService);
    profile = signal<User | null>(null);
    isLoading = signal(false);
    loadError = signal<string | null>(null);
    isEditing = signal(false);
    isSaving = signal(false);
    isUploadingAvatar = signal(false);
    isDeletingAvatar = signal(false);
    editForm = this.fb.nonNullable.group({
        firstName: ['', [Validators.required, Validators.minLength(NAME_MIN_LENGTH)]],
        lastName: ['', [Validators.required, Validators.minLength(NAME_MIN_LENGTH)]],
        phone: ['', [Validators.pattern(PHONE_ALLOWED_PATTERN), this.phoneDigitsValidator]],
    });
    displayName = computed(() => {
        const user = this.profile();
        if (!user)
            return 'User';
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        return name || user.email;
    });
    avatarText = computed(() => {
        const user = this.profile();
        if (!user)
            return 'U';
        const first = user.firstName?.trim()?.[0] ?? '';
        const last = user.lastName?.trim()?.[0] ?? '';
        const initials = `${first}${last}`.toUpperCase();
        return initials || user.email?.trim()?.[0]?.toUpperCase() || 'U';
    });
    companyName = computed(() => {
        const user = this.profile();
        if (!user)
            return '—';
        return user.company?.name || user.companyName || '—';
    });
    ngOnInit(): void {
        this.loadProfile();
    }
    loadProfile(): void {
        this.isLoading.set(true);
        this.loadError.set(null);
        this.userApi
            .getProfile()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: (user) => {
                this.profile.set(user);
                this.auth.syncCurrentUser(user);
                this.syncFormFromProfile(user);
            },
            error: (error: {
                message?: string;
            }) => {
                this.profile.set(null);
                this.loadError.set(error?.message || this.t('messages.profile.loadFailed'));
            },
        });
    }
    startEdit(): void {
        const user = this.profile();
        if (!user)
            return;
        this.syncFormFromProfile(user);
        this.isEditing.set(true);
    }
    cancelEdit(): void {
        const user = this.profile();
        if (user)
            this.syncFormFromProfile(user);
        this.isEditing.set(false);
    }
    saveProfile(): void {
        const user = this.profile();
        if (!user || this.editForm.invalid) {
            this.editForm.markAllAsTouched();
            return;
        }
        const raw = this.editForm.getRawValue();
        const payload = {
            firstName: raw.firstName.trim(),
            lastName: raw.lastName.trim(),
            phone: raw.phone.trim() || null,
        };
        this.isSaving.set(true);
        this.userApi
            .updateMyProfile(user.id, payload)
            .pipe(finalize(() => this.isSaving.set(false)))
            .subscribe({
            next: (updated) => {
                const merged = {
                    ...user,
                    ...updated,
                };
                this.profile.set(merged);
                this.auth.syncCurrentUser(merged);
                this.syncFormFromProfile(merged);
                this.isEditing.set(false);
                this.snackBar.open(this.t('messages.profile.updated'), this.t('common.close'), { duration: 2500 });
            },
            error: (error: unknown) => {
                const message = this.describeProfileSaveError(error);
                const duration = message.length > 120 ? 8000 : 4000;
                this.snackBar.open(message, this.t('common.close'), { duration });
            },
        });
    }
    onAvatarFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement | null;
        const file = input?.files?.[0];
        if (!file || !this.profile())
            return;
        this.isUploadingAvatar.set(true);
        this.userApi
            .uploadAvatar(file)
            .pipe(finalize(() => this.isUploadingAvatar.set(false)))
            .subscribe({
            next: () => {
                this.snackBar.open(this.t('messages.profile.avatarUpdated'), this.t('common.close'), { duration: 2500 });
                this.loadProfile();
                if (input)
                    input.value = '';
            },
            error: (error: unknown) => {
                const message = this.avatarHttpMessage(error, this.t('messages.profile.avatarUploadFailed'));
                this.snackBar.open(message, this.t('common.close'), { duration: 5500 });
                if (input)
                    input.value = '';
            },
        });
    }
    removeAvatar(): void {
        if (!this.profile()?.avatar)
            return;
        this.isDeletingAvatar.set(true);
        this.userApi
            .deleteMyAvatar()
            .pipe(finalize(() => this.isDeletingAvatar.set(false)))
            .subscribe({
            next: () => {
                this.profile.update((prev) => (prev ? { ...prev, avatar: undefined } : prev));
                this.auth.patchCurrentUser({ avatar: undefined });
                this.snackBar.open(this.t('messages.profile.avatarRemoved'), this.t('common.close'), { duration: 2500 });
            },
            error: (error: unknown) => {
                const message = this.avatarHttpMessage(error, this.t('messages.profile.avatarDeleteFailed'));
                this.snackBar.open(message, this.t('common.close'), { duration: 5500 });
            },
        });
    }
    private describeProfileSaveError(error: unknown): string {
        const httpErr = error instanceof HttpErrorResponse ? error : null;
        const payload = httpErr?.error;
        const code =
            payload && typeof payload === 'object' && 'code' in payload
                ? String((payload as { code?: string }).code ?? '')
                : '';
        if (httpErr?.status === 403 && code === 'AUTH_5007') {
            return this.t('messages.profile.auth5007Patch');
        }
        return this.extractApiMessage(payload) || this.t('messages.profile.updateFailed');
    }
    /** Nest/class-validator often returns `message` as a string[] */
    private extractApiMessage(payload: unknown): string {
        if (typeof payload === 'string' && payload.trim())
            return payload.trim();
        if (!payload || typeof payload !== 'object')
            return '';
        const message = (payload as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim())
            return message.trim();
        if (Array.isArray(message) && message.length)
            return message.map(String).join('; ');
        return '';
    }
    /** Backend AUTH_5007 on /users/me/avatar is a server guard issue (Swagger gets the same 403). */
    private avatarHttpMessage(error: unknown, fallback: string): string {
        const httpErr = error instanceof HttpErrorResponse ? error : null;
        const payload = httpErr?.error;
        const code = payload && typeof payload === 'object' && 'code' in payload
            ? String((payload as { code?: string }).code ?? '')
            : '';
        if (code === 'AUTH_5007') {
            return this.t('messages.profile.auth5007Avatar');
        }
        const msg = this.extractApiMessage(payload);
        return msg || fallback;
    }
    onPhoneInput(event: Event): void {
        const input = event.target as HTMLInputElement | null;
        if (!input)
            return;
        const limited = this.normalizeAndLimitPhone(input.value, PHONE_MAX_DIGITS);
        if (limited !== input.value) {
            input.value = limited;
        }
        this.editForm.controls.phone.setValue(limited, { emitEvent: false });
        this.editForm.controls.phone.markAsTouched();
        this.editForm.controls.phone.updateValueAndValidity({ emitEvent: false });
    }
    canDeactivate(): boolean | Observable<boolean> {
        if (!this.isEditing() || !this.editForm.dirty || this.isSaving())
            return true;
        return this.dialog
            .open(ConfirmDialogComponent, {
            width: '420px',
            data: {
                message: this.t('messages.profile.unsavedConfirm'),
            },
        })
            .afterClosed()
            .pipe(map((confirmed: boolean) => !!confirmed));
    }
    @HostListener('window:beforeunload', ['$event'])
    beforeUnload(event: BeforeUnloadEvent): void {
        if (this.isEditing() && this.editForm.dirty && !this.isSaving()) {
            event.preventDefault();
            event.returnValue = true;
        }
    }
    private syncFormFromProfile(user: User): void {
        this.editForm.setValue({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
        });
    }
    private phoneDigitsValidator(control: AbstractControl): ValidationErrors | null {
        const value = String(control.value ?? '').trim();
        if (!value)
            return null;
        const digitsCount = value.replace(/\D/g, '').length;
        if (digitsCount < PHONE_MIN_DIGITS || digitsCount > PHONE_MAX_DIGITS) {
            return {
                phoneDigitsRange: {
                    min: PHONE_MIN_DIGITS,
                    max: PHONE_MAX_DIGITS,
                    actual: digitsCount,
                },
            };
        }
        return null;
    }
    private normalizeAndLimitPhone(value: string, maxDigits: number): string {
        const trimmed = value.trim();
        if (!trimmed)
            return '';
        let working = trimmed.replace(/\+/g, '');
        working = `+${working}`;
        let digitsCount = 0;
        let result = '';
        for (let i = 0; i < working.length; i++) {
            const ch = working[i];
            if (/\d/.test(ch)) {
                if (digitsCount >= maxDigits) {
                    continue;
                }
                digitsCount += 1;
                result += ch;
                continue;
            }
            result += ch;
        }
        return result;
    }
    roleText(role: string | null | undefined): string {
        const normalized = String(role ?? 'employee').trim().toLowerCase();
        return this.t(`roles.${normalized}`);
    }
    statusText(status: string | null | undefined): string {
        const normalized = String(status ?? 'active').trim().toLowerCase();
        return this.t(`statuses.${normalized}`);
    }
    private t(key: string): string {
        return this.translate.instant(key);
    }
}
