import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

interface LoginResponse {
  success?: boolean;
  accessToken?: string;
  user?: User;
  data?: {
    accessToken?: string;
    user?: User;
  };
}

interface RegisterResponse {
  data: User;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
}

export type { LoginResponse, RegisterResponse, DeleteResponse };

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`, { withCredentials: true });
  }

  createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, data, { withCredentials: true });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`, { withCredentials: true });
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}`, data, { withCredentials: true });
  }

  // Auth
  register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.baseUrl}/auth/register`,
      data,
      { withCredentials: true }
    );
  }

  login(data: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/auth/login`,
      data,
      { withCredentials: true }
    );
  }

  refresh(data: {} = {}): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/auth/refresh`, data, { withCredentials: true });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/profile`, { withCredentials: true });
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/profile`, data, { withCredentials: true });
  }

  deleteUser(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.baseUrl}/users/${id}`, { withCredentials: true });
  }
}