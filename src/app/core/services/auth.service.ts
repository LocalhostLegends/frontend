import { Injectable, signal, computed } from '@angular/core';
import { UserRole, User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'auth-users';
  private readonly sessionKey = 'auth-current-user';

  private users = this.loadUsers();
  public currentUser = signal<User | null>(this.loadSession());
  public isAuthenticated = computed(() => !!this.currentUser());
  public userRole = computed(() => this.currentUser()?.role || null);

  register(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    role: UserRole = 'employee',
  ): void {
    const normalizedEmail = email.trim().toLowerCase();
    if (this.users.find((user) => user.email === normalizedEmail)) {
      throw new Error('User with this email already exists.');
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: normalizedEmail,
      password: password,
      role,
    };

    this.users.push(newUser);
    this.saveUsers();
    this.setSession(newUser);
  }

  login(email: string, password: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users.find((u) => u.email === normalizedEmail && u.password === password);

    if (user) {
      this.setSession(user);
      return true; 
    }

    return false; 
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.sessionKey);
  }

  private setSession(user: User): void {
    this.currentUser.set({ ...user });
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
  }

  private loadUsers(): User[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as User[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveUsers(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.users));
  }

  private loadSession(): User | null {
    const raw = localStorage.getItem(this.sessionKey);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as User;
      return parsed;
    } catch {
      return null;
    }
  }
}
