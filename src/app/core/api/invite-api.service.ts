import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { Invite, CreateInviteRequest } from '@app/core/models/invite.model';
import { ApiResponse, SuccessResponse } from './api-types';
import { LoginResponse } from './auth-api.service';
import { User } from '@app/core/models/user.model';
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
function looksLikeAccessJwt(value: string): boolean {
    const v = value.trim();
    return v.startsWith('eyJ') && v.includes('.');
}
@Injectable({ providedIn: 'root' })
export class InviteApiService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;
    validateInvite(token: string): Observable<ValidateInviteResponse> {
        const t = token.trim();
        const url = `${this.baseUrl}/invites/validate`;
        const params = new HttpParams({ fromObject: { token: t } });
        return this.http.get<ValidateInviteResponse>(url, { params }).pipe(catchError((err: unknown) => {
            if (err instanceof HttpErrorResponse && err.status === 405) {
                return this.http.post<ValidateInviteResponse>(url, { token: t });
            }
            return throwError(() => err);
        }));
    }
    acceptInvite(data: AcceptInviteRequest): Observable<LoginResponse | null> {
        return this.http.post<unknown>(`${this.baseUrl}/invites/accept`, data).pipe(map((body) => this.unwrapLoginBody(body)));
    }
    private unwrapLoginBody(body: unknown, depth = 0): LoginResponse | null {
        if (!body || typeof body !== 'object' || depth > 4) {
            return null;
        }
        const o = body as Record<string, unknown>;
        const user = o['user'] && typeof o['user'] === 'object' ? (o['user'] as User) : ({} as User);
        let token: string | null = null;
        if (typeof o['accessToken'] === 'string') {
            token = o['accessToken'];
        }
        else if (typeof o['access_token'] === 'string') {
            token = o['access_token'];
        }
        else if (o['tokens'] && typeof o['tokens'] === 'object') {
            const t = o['tokens'] as Record<string, unknown>;
            if (typeof t['accessToken'] === 'string') {
                token = t['accessToken'];
            }
            else if (typeof t['access_token'] === 'string') {
                token = t['access_token'];
            }
        }
        else if (typeof o['token'] === 'string' && looksLikeAccessJwt(o['token'])) {
            token = o['token'];
        }
        if (typeof token === 'string' && token.length > 0) {
            return { accessToken: token, user };
        }
        if (o['data'] != null) {
            return this.unwrapLoginBody(o['data'], depth + 1);
        }
        return null;
    }
    resendInvite(data: {
        inviteId: string;
    }): Observable<Invite> {
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
            return body.map((item) => this.normalizeInvite(item));
        }
        if (body && typeof body === 'object' && 'data' in body) {
            const data = (body as ApiResponse<Invite[]>).data;
            return Array.isArray(data) ? data.map((item) => this.normalizeInvite(item)) : [];
        }
        return [];
    }
    private unwrapInvite(body: Invite | ApiResponse<Invite> | unknown): Invite {
        if (body && typeof body === 'object' && 'data' in body) {
            return this.normalizeInvite((body as ApiResponse<Invite>).data);
        }
        return this.normalizeInvite(body);
    }
    private normalizeInvite(raw: unknown): Invite {
        const invite = (raw ?? {}) as Invite & Record<string, unknown>;
        const createdAtCandidate = (typeof invite.createdAt === 'string' && invite.createdAt) ||
            (typeof invite['created_at'] === 'string' && invite['created_at']) ||
            (typeof invite['invitedAt'] === 'string' && invite['invitedAt']) ||
            (typeof invite['sentAt'] === 'string' && invite['sentAt']) ||
            (typeof invite.acceptedAt === 'string' && invite.acceptedAt) ||
            (typeof invite.expiresAt === 'string' && invite.expiresAt) ||
            (typeof invite['updatedAt'] === 'string' && invite['updatedAt']) ||
            '';
        return {
            ...invite,
            createdAt: createdAtCandidate,
        } as Invite;
    }
}
