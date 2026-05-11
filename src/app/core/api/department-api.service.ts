import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Department } from '@app/core/models/department.model';
import { ApiResponse } from './api-types';
@Injectable({ providedIn: 'root' })
export class DepartmentApiService {
    private http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/departments`;
    getDepartments(): Observable<Department[]> {
        return this.http
            .get<Department[] | ApiResponse<Department[]>>(this.baseUrl)
            .pipe(map((body) => this.unwrapArray(body)));
    }
    getDepartment(id: string): Observable<Department> {
        return this.http
            .get<Department | ApiResponse<Department>>(`${this.baseUrl}/${id}`)
            .pipe(map((body) => this.unwrapOne(body)));
    }
    createDepartment(body: Partial<Department>): Observable<Department> {
        return this.http
            .post<Department | ApiResponse<Department>>(this.baseUrl, body)
            .pipe(map((body) => this.unwrapOne(body)));
    }
    updateDepartment(id: string, body: Partial<Department>): Observable<Department> {
        return this.http
            .patch<Department | ApiResponse<Department>>(`${this.baseUrl}/${id}`, body)
            .pipe(map((body) => this.unwrapOne(body)));
    }
    deleteDepartment(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
    private unwrapArray(body: Department[] | ApiResponse<Department[]> | unknown): Department[] {
        if (Array.isArray(body)) {
            return body;
        }
        if (body && typeof body === 'object' && 'data' in body) {
            const data = (body as ApiResponse<Department[]>).data;
            return Array.isArray(data) ? data : [];
        }
        return [];
    }
    private unwrapOne(body: Department | ApiResponse<Department> | unknown): Department {
        if (body && typeof body === 'object' && 'data' in body) {
            return (body as ApiResponse<Department>).data;
        }
        return body as Department;
    }
}
