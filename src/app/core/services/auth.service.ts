import { Injectable, inject, Injector, signal, computed } from '@angular/core';
import { AuthApiService, LoginResponse } from '../api/auth-api.service';
import { CompanyApiService } from '@app/core/api/company-api.service';
import { UserApiService } from '@app/core/api/user-api.service';
import { User } from '@app/core/models/user.model';
import { JwtPayload } from '@app/core/models/jwt.model';
import { UserRole } from '@app/core/constants/roles.constants';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { InviteApiService } from '@app/core/api/invite-api.service';
import { canSeeOrganizationData, normalizeUserRole } from '@app/core/constants/roles.constants';


@Injectable({ providedIn: 'root' })

export class AuthService {
  private injector = inject(Injector);
  private api = inject(AuthApiService);
  private inviteApi = inject(InviteApiService);
  private companyApi = inject(CompanyApiService);
  private userApi = inject(UserApiService);

  currentUser = signal<User | null>(null);
  accessToken = signal<string | null>(null);
  isAuthenticated = computed(() => !!this.accessToken());
  userRole = computed(() => this.currentUser()?.role || null);
  constructor() {
    this.restoreSession();
  }
  private restoreSession() {
    const token = localStorage.getItem('token');
    if (!token) return;
    this.accessToken.set(token);
    const storedUserRaw = localStorage.getItem('user');
    const storedUser = storedUserRaw ? (JSON.parse(storedUserRaw) as User) : null;
    const tokenUser = this.userFromToken(token);
    const user = this.mergeUsers(tokenUser, storedUser);
    if (user) {
      this.currentUser.set(user);
      localStorage.setItem('user', JSON.stringify(user));
      this.syncCompanyNameFromApi();
      this.syncCurrentUserFromProfile();
    }
  }
private decodeJWT(token: string): JwtPayload | null {

  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (e) {
    console.error('AuthService: Failed to decode JWT', e);
    return null;
  }
}
private userFromToken(token: string): User | null {
  const payload = this.decodeJWT(token);
  if (!payload || !payload.sub || !payload.email) {
    return null; 
  }
    const tokenRoles = Array.isArray(payload.roles)
      ? (payload.roles as unknown[]).filter((item): item is string => typeof item === 'string')
      : undefined;
    return {
      id: payload.sub,
      email: payload.email,
      role: normalizeUserRole((payload.role as string) || tokenRoles?.[0] || null),
      roles: tokenRoles?.map((role) => normalizeUserRole(role)),
      firstName: payload.email.split('@')[0],
      lastName: '',
      companyName: '',
    };
  }
  register(
    companyName: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    return this.api.registerCompany({ companyName, firstName, lastName, email, password });
  }
  login(email: string, password: string) {
    return this.api
      .login({ email, password })
      .pipe(map((res: LoginResponse) => this.applyLoginResponse(res)));
  }
  acceptInvite(
    token: string,
    firstName: string,
    lastName: string,
    password: string,
    inviteEmailHint?: string,
  ) {
    return this.inviteApi.acceptInvite({ token, firstName, lastName, password }).pipe(
      switchMap((res) => {
        if (res?.accessToken) {
          return of(this.applyLoginResponse(res));
        }
        const emailHint = inviteEmailHint?.trim() ?? '';
        if (emailHint) {
          return this.api
            .login({ email: emailHint, password })
            .pipe(map((lr) => this.applyLoginResponse(lr)));
        }
        return this.inviteApi.validateInvite(token).pipe(
          switchMap((v) => {
            const vRecord = v as unknown as Record<string, unknown>;
            const nestedData =
              vRecord['data'] && typeof vRecord['data'] === 'object'
                ? (vRecord['data'] as Record<string, unknown>)
                : null;
            const email =
              v.invite?.email?.trim() ||
              (nestedData && typeof nestedData['email'] === 'string' ? nestedData['email'].trim() : '');
            if (!email) {
              return throwError(
                () =>
                  new Error(
                    'No access token and no email from invite; check backend response shape.',
                  ),
              );
            }
            return this.api
              .login({ email, password })
              .pipe(map((lr) => this.applyLoginResponse(lr)));
          }),
        );
      }),
    );
  }
  private applyLoginResponse(res: LoginResponse): User {
    const token = res.accessToken ?? null;
    if (!token) throw new Error('No access token received');
    this.accessToken.set(token);
    localStorage.setItem('token', token);
    if (res.refreshToken) {
      localStorage.setItem('refreshToken', res.refreshToken);
    }
    const user = this.mergeUsers(this.userFromToken(token), res.user);
    if (!user) throw new Error('Invalid token');
    this.currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user));
    this.syncCompanyNameFromApi();
    this.syncCurrentUserFromProfile();
    return user;
  }
  private syncCurrentUserFromProfile() {
    if (!this.accessToken()) return;
    this.userApi.getProfile().subscribe({
      next: (profile) => {
        const merged = this.mergeUsers(this.currentUser(), profile);
        if (!merged) return;
        this.syncCurrentUser(merged);
      },
      error: () => {},
    });
  }
  private syncCompanyNameFromApi() {
    if (!this.accessToken()) return;
    if (!canSeeOrganizationData(this.userRole())) {
      this.syncCompanyNameFromProfile();
      return;
    }
    this.companyApi.getCompany(this.currentUser()?.companyId ?? '').subscribe({
      
      next: (company) => {
        const companyRecord = company as unknown as Record<string, unknown>;
        const name =
          (typeof companyRecord['name'] === 'string' && companyRecord['name']) ||
          (typeof companyRecord['companyName'] === 'string' && companyRecord['companyName']) ||
          '';
        const companyName = name.trim();
        if (companyName) {
          this.patchCurrentUserCompany(companyName, company.id);
          return;
        }
        this.syncCompanyNameFromProfile();
      },
      error: () => {
        this.syncCompanyNameFromProfile();
      },
    });
  }
  private syncCompanyNameFromProfile() {
    this.userApi.getProfile().subscribe({
      next: (profile) => {
        const profileRecord = profile as unknown as Record<string, unknown>;
        const profileCompany =
          profileRecord['company'] && typeof profileRecord['company'] === 'object'
            ? (profileRecord['company'] as Record<string, unknown>)
            : null;
        const companyName =
          (profileCompany &&
            typeof profileCompany['name'] === 'string' &&
            profileCompany['name'].trim()) ||
          (typeof profileRecord['companyName'] === 'string' &&
            profileRecord['companyName'].trim()) ||
          '';
        const companyId =
          (profileCompany && typeof profileCompany['id'] === 'string' && profileCompany['id']) ||
          (typeof profileRecord['companyId'] === 'string' && profileRecord['companyId']) ||
          '';
        if (!companyName) return;
        this.patchCurrentUserCompany(companyName, companyId);
      },
      error: () => {},
    });
  }
  private patchCurrentUserCompany(companyName: string, companyId?: string) {
    const current = this.currentUser();
    if (!current) return;
    const updated: User = {
      ...current,
      companyName,
      companyId: current.companyId || companyId || '',
    };
    this.currentUser.set(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }
  private mergeUsers(primary: User | null, secondary: User | null | undefined): User | null {
    if (!primary && !secondary) return null;
    const primaryRecord = (primary ?? {}) as User & Record<string, unknown>;
    const secondaryRecord = (secondary ?? {}) as User & Record<string, unknown>;
    const secondaryCompany =
      secondaryRecord['company'] && typeof secondaryRecord['company'] === 'object'
        ? (secondaryRecord['company'] as unknown as Record<string, unknown>)
        : null;
    const nestedCompanyName =
      (secondaryCompany &&
        typeof secondaryCompany['name'] === 'string' &&
        secondaryCompany['name']) ||
      '';
    const nestedCompanyId =
      (secondaryCompany && typeof secondaryCompany['id'] === 'string' && secondaryCompany['id']) ||
      '';
    const secondaryRoles = Array.isArray(secondaryRecord['roles'])
      ? (secondaryRecord['roles'] as unknown[]).filter(
          (item): item is UserRole => typeof item === 'string',
        )
      : undefined;
    const primaryRoles = Array.isArray(primaryRecord['roles'])
      ? (primaryRecord['roles'] as unknown[]).filter(
          (item): item is UserRole => typeof item === 'string',
        )
      : undefined;
    const roleFromRoles = secondaryRoles?.[0] || primaryRoles?.[0];
    const roleSource = secondary?.role ?? roleFromRoles ?? primary?.role ?? null;
    return {
      ...(primary ?? {}),
      ...(secondary ?? {}),
      id: secondary?.id || primary?.id || '',
      email: secondary?.email || primary?.email || '',
      role: normalizeUserRole(roleSource as string | null | undefined),
      roles: secondaryRoles || primaryRoles,
      firstName: secondary?.firstName || primary?.firstName || '',
      lastName: secondary?.lastName || primary?.lastName || '',
      companyName: secondary?.companyName || nestedCompanyName || primary?.companyName || '',
      companyId: secondary?.companyId || nestedCompanyId || primary?.companyId || '',
    } as User;
  }
  inviteHR(email: string) {
    return this.api.createHR({ email });
  }
  inviteEmployee(email: string) {
    return this.api.createEmployee({ email });
  }
  logout() {
    const router = this.injector.get(Router);
    return this.api.logout().pipe(
      catchError(() => of(void 0)),
      tap(() => {
        this.accessToken.set(null);
        this.currentUser.set(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
       void router.navigate(['/auth/login'], { replaceUrl: true });
      }),
    );
  }
  /**
   * Merge with the previous user so GET /users/me (profile) does not wipe fields the API omits
   * at the root — e.g. `company: { name }` without `companyName`, which broke the header label.
   */
  syncCurrentUser(nextUser: User) {
    const merged = this.mergeUsers(this.currentUser(), nextUser);
    if (!merged) {
      return;
    }
    this.currentUser.set(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  }
  patchCurrentUser(patch: Partial<User>) {
    const current = this.currentUser();
    if (!current) return;
    const nextUser: User = { ...current, ...patch };
    this.syncCurrentUser(nextUser);
  }
  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.api.refreshTokens({ refreshToken }).pipe(
      tap((response) => {
        this.accessToken.set(response.accessToken);
        localStorage.setItem('token', response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }),
      map((response) => response.accessToken),
    );
  }
}
