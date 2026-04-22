import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invite, CreateInviteRequest } from '../models/invite.model';
import { ApiResponse, SuccessResponse } from './api-types';

export interface AcceptInviteRequest {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ValidateInviteResponse {
  success: boolean;
  valid: boolean;
  invite?: {
    email: string;
    companyName: string;
    role: string;
  };
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class InviteApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  validateInvite(token: string): Observable<ValidateInviteResponse> {
    return this.http.get<ValidateInviteResponse>(`${this.baseUrl}/invites/validate?token=${encodeURIComponent(token)}`);
  }

  acceptInvite(data: AcceptInviteRequest): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(`${this.baseUrl}/invites/accept`, data);
  }

  /** POST /invites/resend — у відповіді може бути оновлений Invite */
  resendInvite(data: { inviteId: string }): Observable<Invite> {
    return this.http
      .post<Invite | ApiResponse<Invite>>(`${this.baseUrl}/invites/resend`, data)
      .pipe(map((body) => this.unwrapInvite(body)));
  }

  cancelInvite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/invites/${id}`);
  }

  getPendingInvites(): Observable<Invite[]> {
    return this.http
      .get<Invite[] | ApiResponse<Invite[]>>(`${this.baseUrl}/invites/pending`)
      .pipe(map((body) => this.unwrapInviteArray(body)));
  }

  getCompanyInvites(): Observable<Invite[]> {
    return this.http
      .get<Invite[] | ApiResponse<Invite[]>>(`${this.baseUrl}/invites/company`)
      .pipe(map((body) => this.unwrapInviteArray(body)));
  }

  createInvite(data: CreateInviteRequest): Observable<Invite> {
    return this.http
      .post<Invite | ApiResponse<Invite>>(`${this.baseUrl}/invites`, data)
      .pipe(map((body) => this.unwrapInvite(body)));
  }

  private unwrapInviteArray(body: Invite[] | ApiResponse<Invite[]> | unknown): Invite[] {
    if (Array.isArray(body)) {
      return body;
    }
    if (body && typeof body === 'object' && 'data' in body) {
      const data = (body as ApiResponse<Invite[]>).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }

  private unwrapInvite(body: Invite | ApiResponse<Invite> | unknown): Invite {
    if (body && typeof body === 'object' && 'data' in body) {
      return (body as ApiResponse<Invite>).data;
    }
    return body as Invite;
  }
}
