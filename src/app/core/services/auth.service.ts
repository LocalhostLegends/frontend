import { Injectable, signal, computed } from '@angular/core';
import { ApiService, LoginResponse } from '../../services/api.service';
import { User, UserRole } from '../../models/user.model';
import { tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';


interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);
  accessToken = signal<string | null>(null);

  isAuthenticated = computed(() => !!this.currentUser() && !!this.accessToken());
  userRole = computed(() => this.currentUser()?.role || null);

  constructor(private api: ApiService, private router: Router) {
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

  private decodeJWT(token: string): JWTPayload | null {
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
      role: payload.role as UserRole,
      firstName: payload.email.split('@')[0],
      lastName: '',
    };
  }

  register(firstName: string, lastName: string, email: string, password: string) {
    return this.api.register({ firstName, lastName, email, password }).pipe(
      tap(() => console.log('User registered successfully'))
    );
  }

  login(email: string, password: string) {
    return this.api.login({ email, password }).pipe(
      map((res: LoginResponse) => {
        const token = res.data?.accessToken ?? res.accessToken ?? null;
        if (!token) throw new Error('No access token received');

        this.accessToken.set(token);
        localStorage.setItem('token', token);

        const user = this.userFromToken(token);
        if (!user) throw new Error('Invalid token');

        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));

        return user;
      })
    );
  }

  logout() {
    this.accessToken.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }
}