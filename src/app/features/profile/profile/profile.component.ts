import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { UserApiService } from '../../../core/api/user-api.service';
import { User } from '../../../core/models/user.model';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingButtonComponent } from '../../../core/ui/loading-button/loading-button.component';
import { PendingChangesAware } from '../../../core/guards/pending-changes.guard';
import { AuthService } from '../../../core/services/auth.service';

const PHONE_ALLOWED_PATTERN = /^\+[0-9 ()-]*$/;
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 12;

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
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, PendingChangesAware {
  private userApi = inject(UserApiService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private auth = inject(AuthService);

  profile = signal<User | null>(null);
  isLoading = signal(false);
  loadError = signal<string | null>(null);
  isEditing = signal(false);
  isSaving = signal(false);
  isUploadingAvatar = signal(false);
  isDeletingAvatar = signal(false);

  editForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', [Validators.pattern(PHONE_ALLOWED_PATTERN), this.phoneDigitsValidator]],
  });

  displayName = computed(() => {
    const user = this.profile();
    if (!user) return 'User';
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name || user.email;
  });

  avatarText = computed(() => {
    const user = this.profile();
    if (!user) return 'U';
    const first = user.firstName?.trim()?.[0] ?? '';
    const last = user.lastName?.trim()?.[0] ?? '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || user.email?.trim()?.[0]?.toUpperCase() || 'U';
  });

  companyName = computed(() => {
    const user = this.profile();
    if (!user) return '—';
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
        error: (error: { message?: string }) => {
          this.profile.set(null);
          this.loadError.set(error?.message || 'Unable to load profile');
        },
      });
  }

  startEdit(): void {
    const user = this.profile();
    if (!user) return;
    this.syncFormFromProfile(user);
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    const user = this.profile();
    if (user) this.syncFormFromProfile(user);
    this.isEditing.set(false);
  }

  saveProfile(): void {
    const user = this.profile();
    if (!user || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const raw = this.editForm.getRawValue();
    const payload: Partial<User> = {
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      phone: raw.phone.trim() || null,
    };

    this.isSaving.set(true);
    this.userApi
      .updateUser(user.id, payload)
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
          this.snackBar.open('Profile updated', 'Close', { duration: 2500 });
        },
        error: (error: { error?: { message?: string } }) => {
          const message = error?.error?.message || 'Failed to update profile';
          this.snackBar.open(message, 'Close', { duration: 3500 });
        },
      });
  }

  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    this.isUploadingAvatar.set(true);
    this.userApi
      .uploadAvatar(file)
      .pipe(finalize(() => this.isUploadingAvatar.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Avatar updated', 'Close', { duration: 2500 });
          this.loadProfile();
          if (input) input.value = '';
        },
        error: (error: { error?: { message?: string } }) => {
          const message = error?.error?.message || 'Failed to upload avatar';
          this.snackBar.open(message, 'Close', { duration: 3500 });
          if (input) input.value = '';
        },
      });
  }

  removeAvatar(): void {
    if (!this.profile()?.avatar) return;
    this.isDeletingAvatar.set(true);
    this.userApi
      .deleteMyAvatar()
      .pipe(finalize(() => this.isDeletingAvatar.set(false)))
      .subscribe({
        next: () => {
          this.profile.update((prev) => (prev ? { ...prev, avatar: undefined } : prev));
          this.auth.patchCurrentUser({ avatar: undefined });
          this.snackBar.open('Avatar removed', 'Close', { duration: 2500 });
        },
        error: (error: { error?: { message?: string } }) => {
          const message = error?.error?.message || 'Failed to delete avatar';
          this.snackBar.open(message, 'Close', { duration: 3500 });
        },
      });
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    const limited = this.normalizeAndLimitPhone(input.value, PHONE_MAX_DIGITS);
    if (limited !== input.value) {
      input.value = limited;
    }
    this.editForm.controls.phone.setValue(limited, { emitEvent: false });
    this.editForm.controls.phone.markAsTouched();
    this.editForm.controls.phone.updateValueAndValidity({ emitEvent: false });
  }

  canDeactivate(): boolean {
    if (!this.isEditing() || !this.editForm.dirty || this.isSaving()) return true;
    return confirm('You have unsaved profile changes. Leave this page?');
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
    if (!value) return null;
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
    if (!trimmed) return '';

    // Keep one leading plus as required prefix.
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
}
