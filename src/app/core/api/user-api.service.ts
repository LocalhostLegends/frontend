import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/user.model';
import { ApiResponse, SuccessResponse } from './api-types';

/** Query params for GET /users (pagination + filters — назви як у бекенду). */
export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

/** Якщо бекенд повертає обгортку з пагінацією всередині `data`. */
export interface UsersPagePayload {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** GET /users — список + опційно query (page, limit, filters). */
  getUsers(query?: UsersQueryParams): Observable<User[]> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return this.http
      .get<ApiResponse<User[] | UsersPagePayload>>(`${this.baseUrl}/users`, { params })
      .pipe(map((res) => this.normalizeUsersList(res.data)));
  }

  /** GET /users — якщо потрібна повна відповідь з total/page (поруч з data). */
  getUsersPage(query?: UsersQueryParams): Observable<UsersPagePayload> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return this.http
      .get<ApiResponse<User[] | UsersPagePayload>>(`${this.baseUrl}/users`, { params })
      .pipe(
        map((res) => {
          const data = res.data;
          if (Array.isArray(data)) {
            return {
              users: data,
              total: data.length,
              page: Number(query?.page ?? 1),
              limit: Number(query?.limit ?? (data.length || 10)),
            };
          }
          return data as UsersPagePayload;
        }),
      );
  }

  /** GET /users/role/{role} */
  getUsersByRole(role: UserRole | string): Observable<User[]> {
    return this.http
      .get<ApiResponse<User[]>>(`${this.baseUrl}/users/role/${encodeURIComponent(role)}`)
      .pipe(map((res) => this.normalizeUsersList(res.data)));
  }

  /** GET /users/status/{status} */
  getUsersByStatus(status: string): Observable<User[]> {
    return this.http
      .get<ApiResponse<User[]>>(`${this.baseUrl}/users/status/${encodeURIComponent(status)}`)
      .pipe(map((res) => this.normalizeUsersList(res.data)));
  }

  /** GET /users/me */
  getProfile(): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.baseUrl}/users/me`)
      .pipe(map((res) => res.data));
  }

  /** GET /users/{id} */
  getUserById(id: string): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.baseUrl}/users/${id}`)
      .pipe(map((res) => res.data));
  }

  /** PATCH /users/{id} */
  updateUser(id: string, body: Partial<User>): Observable<User> {
    return this.http
      .patch<ApiResponse<User>>(`${this.baseUrl}/users/${id}`, body)
      .pipe(map((res) => res.data));
  }

  /** DELETE /users/{id} */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  /** POST /users/{id}/block */
  blockUser(id: string): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(`${this.baseUrl}/users/${id}/block`, {});
  }

  /** POST /users/{id}/unblock */
  unblockUser(id: string): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(`${this.baseUrl}/users/${id}/unblock`, {});
  }

  /** POST /users/me/avatar — поле файлу часто `avatar` або `file`; за потреби зміни ім’я під бекенд. */
  uploadAvatar(file: File, fieldName = 'avatar'): Observable<User> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.http
      .post<ApiResponse<User>>(`${this.baseUrl}/users/me/avatar`, formData)
      .pipe(map((res) => res.data));
  }

  /** DELETE /users/me/avatar */
  deleteMyAvatar(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/me/avatar`);
  }

  private normalizeUsersList(data: User[] | UsersPagePayload | unknown): User[] {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (Array.isArray(record['users'])) {
        return record['users'] as User[];
      }
      if (Array.isArray(record['items'])) {
        return record['items'] as User[];
      }
    }
    return [];
  }
}
