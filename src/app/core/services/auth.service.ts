import { Injectable, signal, computed } from '@angular/core';
import { AuthApiService, LoginResponse } from '../api/auth-api.service';
import { User } from '../models/user.model';
import { JwtPayload } from '../models/jwt.model';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);
  accessToken = signal<string | null>(null);

  isAuthenticated = computed(() => !!this.accessToken());
  userRole = computed(() => this.currentUser()?.role || null);

  constructor(
    private api: AuthApiService,
    private router: Router,
  ) {
    this.restoreSession();
  }

  private restoreSession() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.accessToken.set(token);
    const user = this.userFromToken(token);
    if (user) {
      this.currentUser.set(user);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  private decodeJWT(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  private userFromToken(token: string): User | null {
    const payload = this.decodeJWT(token);
    if (!payload) return null;

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
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
    return this.api.login({ email, password }).pipe(map((res: LoginResponse) => this.applyLoginResponse(res)));
  }

  /**
   * POST /auth/activate: лише **admin** отримує збережену сесію й може одразу йти на дашборд.
   * HR / employee завжди далі входять через `/auth/login` (токен із відповіді не зберігаємо).
   */
  activate(token: string, password: string) {
    return this.api.activate({ token, password }).pipe(
      map((res) => {
        if (!res?.accessToken) {
          return null;
        }
        const role = this.roleFromActivateResponse(res);
        if (!role || String(role).toLowerCase() !== 'admin') {
          return null;
        }
        try {
          return this.applyLoginResponse(res);
        } catch {
          return null;
        }
      }),
    );
  }

  private roleFromActivateResponse(res: LoginResponse): string | null {
    if (res.user?.role) return res.user.role;
    const u = this.userFromToken(res.accessToken);
    return u?.role ?? null;
  }

  private applyLoginResponse(res: LoginResponse): User {
    const token = res.accessToken ?? null;
    if (!token) throw new Error('No access token received');

    this.accessToken.set(token);
    localStorage.setItem('token', token);

    const user = this.userFromToken(token) ?? res.user ?? null;
    if (!user) throw new Error('Invalid token');

    this.currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  }

  inviteHR(email: string) {
    return this.api.createHR({ email });
  }

  inviteEmployee(email: string) {
    return this.api.createEmployee({ email });
  }

  logout() {
    return this.api.logout().pipe(
      map(() => {
        this.accessToken.set(null);
        this.currentUser.set(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth/login']);
      }),
    );
  }
}
