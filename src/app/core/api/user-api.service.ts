import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { User } from '@app/core/models/user.model';
import { UserRole } from '@app/core/constants/roles.constants';
import { ApiResponse, SuccessResponse } from './api-types';
export interface UsersQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
    search?: string;
    role?: UserRole | string;
    roles?: string[];
    status?: string;
    statuses?: string[];
    email?: string;
    departmentId?: string;
    positionId?: string;
    createdAfter?: string;
    createdBefore?: string;
    pendingOnly?: boolean;
    activeOnly?: boolean;
    blockedOnly?: boolean;
    withDeleted?: boolean;
    companyId?: string;
}
const MAX_USERS_QUERY_LIMIT = 100;
function normalizeUsersQueryForBackend(query?: UsersQueryParams): UsersQueryParams | undefined {
    if (!query) {
        return undefined;
    }
    const out: UsersQueryParams = { ...query };
    if (typeof out.limit === 'number' && out.limit > MAX_USERS_QUERY_LIMIT) {
        out.limit = MAX_USERS_QUERY_LIMIT;
    }
    if (typeof out.sortOrder === 'string' && out.sortOrder.trim() !== '') {
        out.sortOrder = out.sortOrder.trim().toUpperCase() as UsersQueryParams['sortOrder'];
    }
    return out;
}
function appendUsersQueryToParams(normalized?: UsersQueryParams): HttpParams {
    if (!normalized) {
        return new HttpParams();
    }
    let params = new HttpParams();
    for (const [key, value] of Object.entries(normalized)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (Array.isArray(value)) {
            for (const item of value) {
                if (item === undefined || item === null) {
                    continue;
                }
                const s = String(item).trim();
                if (s === '') {
                    continue;
                }
                params = params.append(key, s);
            }
            continue;
        }
        if (typeof value === 'boolean') {
            params = params.append(key, value ? 'true' : 'false');
            continue;
        }
        if (typeof value === 'number') {
            if (!Number.isFinite(value)) {
                continue;
            }
            params = params.append(key, String(value));
            continue;
        }
        const str = String(value).trim();
        if (str === '') {
            continue;
        }
        params = params.append(key, str);
    }
    return params;
}
export interface UsersPagePayload {
    users: User[];
    total: number;
    page: number;
    limit: number;
}
export interface UsersListMeta {
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
}
@Injectable({ providedIn: 'root' })
export class UserApiService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;
    getUsers(query?: UsersQueryParams): Observable<User[]> {
        const normalized = normalizeUsersQueryForBackend(query);
        const params = appendUsersQueryToParams(normalized);
        return this.http
            .get<ApiResponse<unknown>>(`${this.baseUrl}/users`, { params })
            .pipe(map((res) => this.parseUsersResponseBody(res.data, normalized).users));
    }
    getUsersPage(query?: UsersQueryParams): Observable<UsersPagePayload> {
        const normalized = normalizeUsersQueryForBackend(query);
        const params = appendUsersQueryToParams(normalized);
        return this.http
            .get<ApiResponse<unknown>>(`${this.baseUrl}/users`, { params })
            .pipe(map((res) => this.parseUsersResponseBody(res.data, normalized)));
    }
    getUsersAllPages(query?: Omit<UsersQueryParams, 'page' | 'limit'>): Observable<User[]> {
        const limit = MAX_USERS_QUERY_LIMIT;
        const load = (page: number, acc: User[]): Observable<User[]> => this.getUsersPage({ ...query, page, limit }).pipe(switchMap((payload) => {
            const batch = payload.users ?? [];
            const merged = [...acc, ...batch];
            if (batch.length < limit) {
                return of(merged);
            }
            return load(page + 1, merged);
        }));
        return load(1, []);
    }
    getUsersByRole(role: UserRole | string): Observable<User[]> {
        return this.http
            .get<ApiResponse<unknown>>(`${this.baseUrl}/users/role/${encodeURIComponent(role)}`)
            .pipe(map((res) => this.parseUsersResponseBody(res.data).users));
    }
    getUsersByStatus(status: string): Observable<User[]> {
        return this.http
            .get<ApiResponse<unknown>>(`${this.baseUrl}/users/status/${encodeURIComponent(status)}`)
            .pipe(map((res) => this.parseUsersResponseBody(res.data).users));
    }
    getProfile(): Observable<User> {
        return this.http
            .get<ApiResponse<User>>(`${this.baseUrl}/users/me`)
            .pipe(map((res) => res.data));
    }
    getUserById(id: string): Observable<User> {
        return this.http
            .get<ApiResponse<User>>(`${this.baseUrl}/users/${id}`)
            .pipe(map((res) => res.data));
    }
    updateUser(id: string, body: Partial<User>): Observable<User> {
        return this.http
            .patch<ApiResponse<User>>(`${this.baseUrl}/users/${id}`, body)
            .pipe(map((res) => res.data));
    }

    /**
     * OpenAPI has no `PATCH /users/me` (only `PATCH /users/{id}`). Use the current user id from `GET /users/me` and send only basic fields the API allows for self-service.
     */
    updateMyProfile(
        userId: string,
        body: Pick<User, 'firstName' | 'lastName'> & { phone?: string | null },
    ): Observable<User> {
        return this.updateUser(userId, body);
    }
    deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
    }
    blockUser(id: string): Observable<SuccessResponse> {
        return this.http.post<SuccessResponse>(`${this.baseUrl}/users/${id}/block`, {});
    }
    unblockUser(id: string): Observable<SuccessResponse> {
        return this.http.post<SuccessResponse>(`${this.baseUrl}/users/${id}/unblock`, {});
    }
    /**
     * Multipart field name must match the backend (`Unexpected field` => wrong name).
     * This API expects `avatar`, not `file`.
     */
    uploadAvatar(file: File, multipartFieldName: string = 'avatar'): Observable<User> {
        const formData = new FormData();
        formData.append(multipartFieldName, file, file.name);
        return this.http
            .post<ApiResponse<User>>(`${this.baseUrl}/users/me/avatar`, formData)
            .pipe(map((res) => res.data));
    }

    /** Some deployments allow avatar only via `user.update` on a concrete id (admin), not via `/me`. */
    uploadAvatarForUser(userId: string, file: File, multipartFieldName: string = 'avatar'): Observable<User> {
        const formData = new FormData();
        formData.append(multipartFieldName, file, file.name);
        return this.http
            .post<ApiResponse<User>>(`${this.baseUrl}/users/${encodeURIComponent(userId)}/avatar`, formData)
            .pipe(map((res) => res.data));
    }

    /**
     * Try `POST /users/me/avatar` first. If that returns 403/401 (e.g. admin vs “basic profile” rule),
     * try `POST /users/:id/avatar`. If the second call is 404 (route not implemented), rethrow the
     * first error so the user sees AUTH_5007 instead of “Cannot POST”.
     */
    uploadAvatarWithFallback(userId: string, file: File): Observable<User> {
        return this.uploadAvatar(file).pipe(
            catchError((errMe: unknown) => {
                const me = errMe instanceof HttpErrorResponse ? errMe : null;
                if (me?.status === 403 || me?.status === 401) {
                    return this.uploadAvatarForUser(userId, file).pipe(
                        catchError((errId: unknown) => {
                            const idErr = errId instanceof HttpErrorResponse ? errId : null;
                            if (idErr?.status === 404) {
                                return throwError(() => errMe);
                            }
                            return throwError(() => errId);
                        }),
                    );
                }
                return throwError(() => errMe);
            }),
        );
    }

    deleteMyAvatar(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/users/me/avatar`);
    }

    deleteAvatarForUser(userId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/users/${encodeURIComponent(userId)}/avatar`);
    }

    /** Same order as `uploadAvatarWithFallback`: `/me` first, then `/users/:id/avatar` on 403/401. */
    deleteAvatarWithFallback(userId: string): Observable<void> {
        return this.deleteMyAvatar().pipe(
            catchError((errMe: unknown) => {
                const me = errMe instanceof HttpErrorResponse ? errMe : null;
                if (me?.status === 403 || me?.status === 401) {
                    return this.deleteAvatarForUser(userId).pipe(
                        catchError((errId: unknown) => {
                            const idErr = errId instanceof HttpErrorResponse ? errId : null;
                            if (idErr?.status === 404) {
                                return throwError(() => errMe);
                            }
                            return throwError(() => errId);
                        }),
                    );
                }
                return throwError(() => errMe);
            }),
        );
    }

    /** Builds absolute URL for API-hosted media; relative paths use `environment.apiUrl`. */
    resolveMediaUrl(raw: string): string {
        const trimmed = raw.trim();
        if (!trimmed) {
            return '';
        }
        if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
            return trimmed;
        }
        if (/^https?:\/\//i.test(trimmed)) {
            return trimmed;
        }
        const base = this.baseUrl.replace(/\/$/, '');
        const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        return `${base}${path}`;
    }

    /**
     * Loads a resource with Authorization (same as other API calls).
     * Use for avatar URLs: a bare img tag does not send Bearer token and often gets 403.
     */
    getAuthenticatedBlob(url: string): Observable<Blob> {
        const resolved = this.resolveMediaUrl(url);
        if (!resolved || resolved.startsWith('data:') || resolved.startsWith('blob:')) {
            return throwError(() => new Error('Invalid URL for authenticated blob request'));
        }
        return this.http.get(resolved, { responseType: 'blob' });
    }

    /** Current user avatar bytes (pair with POST/DELETE `/users/me/avatar`). */
    getMyAvatarBlob(): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/users/me/avatar`, { responseType: 'blob' });
    }

    private parseUsersResponseBody(body: unknown, queryFallback?: UsersQueryParams): UsersPagePayload {
        const fbPage = Number(queryFallback?.page ?? 1);
        const fbLimit = Number(queryFallback?.limit ?? 10);
        if (Array.isArray(body)) {
            return {
                users: body as User[],
                total: body.length,
                page: fbPage,
                limit: fbLimit || body.length || 10,
            };
        }
        if (!body || typeof body !== 'object') {
            return { users: [], total: 0, page: fbPage, limit: fbLimit };
        }
        const o = body as Record<string, unknown>;
        const nestedData = o['data'];
        const nestedMeta = o['meta'];
        if (Array.isArray(nestedData) && nestedMeta && typeof nestedMeta === 'object') {
            const meta = nestedMeta as UsersListMeta;
            const users = nestedData as User[];
            return {
                users,
                total: typeof meta.totalItems === 'number' ? meta.totalItems : users.length,
                page: typeof meta.page === 'number' ? meta.page : fbPage,
                limit: typeof meta.limit === 'number' ? meta.limit : fbLimit,
            };
        }
        if (Array.isArray(nestedData)) {
            const users = nestedData as User[];
            return {
                users,
                total: users.length,
                page: fbPage,
                limit: fbLimit || users.length || 10,
            };
        }
        if (Array.isArray(o['users'])) {
            const users = o['users'] as User[];
            return {
                users,
                total: typeof o['total'] === 'number' ? o['total'] : users.length,
                page: typeof o['page'] === 'number' ? (o['page'] as number) : fbPage,
                limit: typeof o['limit'] === 'number' ? (o['limit'] as number) : fbLimit,
            };
        }
        if (Array.isArray(o['items'])) {
            const users = o['items'] as User[];
            return { users, total: users.length, page: fbPage, limit: fbLimit };
        }
        return { users: [], total: 0, page: fbPage, limit: fbLimit };
    }
}
