import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import {
  Invite,
  CreateInviteRequest,
  ValidateInviteResponse,
  AcceptInviteRequest,
  AcceptInviteResponse,
  ResendInviteRequest,
  ResendInviteResponse,
} from '../models/invite.model';
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

interface ActivateResponse {
  success: boolean;
  message?: string;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
}

interface IPResponse {
  ip: string;
}

export type {
  LoginResponse,
  RegisterResponse,
  ActivateResponse,
  DeleteResponse,
  ValidateInviteResponse,
  AcceptInviteResponse,
  ResendInviteResponse,
};

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
  registerCompany(data: {
    companyName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register-company`, data, {
      withCredentials: true,
    });
  }

  login(data: { email: string; password: string; ipAddress: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, data, {
      withCredentials: true,
    });
  }

  activate(data: { token: string; password: string }): Observable<ActivateResponse> {
    return this.http.post<ActivateResponse>(`${this.baseUrl}/auth/activate`, data, {
      withCredentials: true,
    });
  }

  getIP(): Observable<IPResponse> {
    return this.http.get<IPResponse>('https://api.ipify.org?format=json');
  }

  refresh(data: {} = {}): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/auth/refresh`, data, { withCredentials: true });
  }

  createHR(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/hr`, data, {
      withCredentials: true,
    });
  }

  createEmployee(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/employee`, data, {
      withCredentials: true,
    });
  }

  logout(): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(
      `${this.baseUrl}/auth/logout`,
      {},
      { withCredentials: true },
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/profile`, { withCredentials: true });
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/profile`, data, { withCredentials: true });
  }

  deleteUser(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.baseUrl}/users/${id}`, {
      withCredentials: true,
    });
  }

  // Invites
  createInvite(data: CreateInviteRequest): Observable<Invite> {
    return this.http.post<Invite>(`${this.baseUrl}/invites`, data, { withCredentials: true });
  }

  validateInvite(token: string): Observable<ValidateInviteResponse> {
    return this.http.get<ValidateInviteResponse>(
      `${this.baseUrl}/invites/validate?token=${token}`,
      { withCredentials: true },
    );
  }

  acceptInvite(data: AcceptInviteRequest): Observable<AcceptInviteResponse> {
    return this.http.post<AcceptInviteResponse>(`${this.baseUrl}/invites/accept`, data, {
      withCredentials: true,
    });
  }

  resendInvite(data: ResendInviteRequest): Observable<ResendInviteResponse> {
    return this.http.post<ResendInviteResponse>(`${this.baseUrl}/invites/resend`, data, {
      withCredentials: true,
    });
  }

  cancelInvite(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.baseUrl}/invites/${id}`, {
      withCredentials: true,
    });
  }

  getCompanyInvites(): Observable<Invite[]> {
    return this.http.get<Invite[]>(`${this.baseUrl}/invites/company`, { withCredentials: true });
  }

  getPendingInvites(): Observable<Invite[]> {
    return this.http.get<Invite[]>(`${this.baseUrl}/invites/pending`, { withCredentials: true });
  }
}
