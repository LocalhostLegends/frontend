import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { User } from '@app/core/models/user.model';
import { ApiResponse } from './api-types';

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
    login(data: {
        email: string;
        password: string;
    }): Observable<LoginResponse> {
        return this.http
            .post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/login`, data)
            .pipe(map((res) => res.data));
    }
    createHR(data: {
        email: string;
    }): Observable<User> {
        return this.http
            .post<ApiResponse<User>>(`${this.baseUrl}/auth/hr`, data)
            .pipe(map((res) => res.data));
    }
    createEmployee(data: {
        email: string;
    }): Observable<User> {
        return this.http
            .post<ApiResponse<User>>(`${this.baseUrl}/auth/employee`, data)
            .pipe(map((res) => res.data));
    }
    refreshTokens(body: RefreshTokenRequest): Observable<RefreshTokenResponse> {
        return this.http
            .post<ApiResponse<RefreshTokenResponse>>(`${this.baseUrl}/auth/refresh`, body)
            .pipe(map((res) => res.data));
    }
    logout(): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/auth/logout`, {});
    }
}
