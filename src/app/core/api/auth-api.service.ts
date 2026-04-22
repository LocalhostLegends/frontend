import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { ApiResponse } from './api-types';

// --- Auth ---

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterCompanyRequest {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}


@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  registerCompany(data: RegisterCompanyRequest): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(`${this.baseUrl}/auth/register-company`, data)
      .pipe(map((res) => res.data));
  }

  login(data: { email: string; password: string }): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/login`, data)
      .pipe(map((res) => res.data));
  }

  /**
   * Якщо бекенд повертає сесію після активації — як при login (accessToken + user).
   * Якщо відповідь порожня — фронт покаже логін (зворотна сумісність).
   */
  activate(data: { token: string; password: string }): Observable<LoginResponse | null> {
    return this.http.post<unknown>(`${this.baseUrl}/auth/activate`, data).pipe(
      map((body) => this.unwrapActivateResponse(body)),
    );
  }

  private unwrapActivateResponse(body: unknown): LoginResponse | null {
    if (!body || typeof body !== 'object') {
      return null;
    }
    const direct = body as LoginResponse & { accessToken?: string };
    if (typeof direct.accessToken === 'string') {
      return direct as LoginResponse;
    }
    const wrapped = body as ApiResponse<LoginResponse>;
    if (
      wrapped &&
      typeof wrapped === 'object' &&
      'data' in wrapped &&
      wrapped.data &&
      typeof (wrapped.data as LoginResponse).accessToken === 'string'
    ) {
      return wrapped.data;
    }
    return null;
  }

  /** POST /auth/hr — лише ADMIN; бекенд створює HR зі статусом INVITED і надсилає лист із /activate?token=… */
  createHR(data: { email: string }): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(`${this.baseUrl}/auth/hr`, data)
      .pipe(map((res) => res.data));
  }

  /** POST /auth/employee — лише HR; співробітник INVITED + email активації */
  createEmployee(data: { email: string }): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(`${this.baseUrl}/auth/employee`, data)
      .pipe(map((res) => res.data));
  }

  /** POST /auth/refresh */
  refreshTokens(body: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return this.http
      .post<ApiResponse<RefreshTokenResponse>>(`${this.baseUrl}/auth/refresh`, body)
      .pipe(map((res) => res.data));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {});
  }

}
