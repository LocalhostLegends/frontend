import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Company } from '@app/core/models/company.model';
import { ApiResponse } from './api-types';
export type CompanySubscriptionPayload = Record<string, unknown>;
export type CompanyStats = Record<string, unknown>;
@Injectable({ providedIn: 'root' })
export class CompanyApiService {
    private http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/companies`;
    createCompany(body: Partial<Company>): Observable<Company> {
        return this.http
            .post<Company | ApiResponse<Company>>(this.baseUrl, body)
            .pipe(map((b) => this.unwrapOne(b)));
    }
    getCompanies(): Observable<Company[]> {
        return this.http
            .get<Company[] | ApiResponse<Company[]>>(this.baseUrl)
            .pipe(map((b) => this.unwrapArray(b)));
    }
    getMyCompany(): Observable<Company> {
        return this.http
            .get<Company | ApiResponse<Company>>(`${this.baseUrl}/my-company`)
            .pipe(map((b) => this.unwrapOne(b)));
    }
    getCompanyStats(): Observable<CompanyStats> {
        return this.http
            .get<CompanyStats | ApiResponse<CompanyStats>>(`${this.baseUrl}/stats`)
            .pipe(map((b) => this.unwrapStats(b)));
    }
    getCompany(id: string): Observable<Company> {
        return this.http
            .get<Company | ApiResponse<Company>>(`${this.baseUrl}/${id}`)
            .pipe(map((b) => this.unwrapOne(b)));
    }
    updateCompany(id: string, body: Partial<Company>): Observable<Company> {
        return this.http
            .patch<Company | ApiResponse<Company>>(`${this.baseUrl}/${id}`, body)
            .pipe(map((b) => this.unwrapOne(b)));
    }
    deleteCompany(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
    updateSubscription(companyId: string, body: CompanySubscriptionPayload): Observable<Company> {
        return this.http
            .post<Company | ApiResponse<Company>>(`${this.baseUrl}/${companyId}/subscription`, body)
            .pipe(map((b) => this.unwrapOne(b)));
    }
    private unwrapArray(body: Company[] | ApiResponse<Company[]> | unknown): Company[] {
        if (Array.isArray(body)) {
            return body;
        }
        if (body && typeof body === 'object' && 'data' in body) {
            const data = (body as ApiResponse<Company[]>).data;
            return Array.isArray(data) ? data : [];
        }
        return [];
    }
    private unwrapOne(body: Company | ApiResponse<Company> | unknown): Company {
        if (body && typeof body === 'object' && 'data' in body) {
            return this.normalizeCompany((body as ApiResponse<unknown>).data);
        }
        return this.normalizeCompany(body);
    }
    private unwrapStats(body: CompanyStats | ApiResponse<CompanyStats> | unknown): CompanyStats {
        if (body && typeof body === 'object' && 'data' in body) {
            return (body as ApiResponse<CompanyStats>).data as CompanyStats;
        }
        return body as CompanyStats;
    }
    private normalizeCompany(raw: unknown): Company {
        if (!raw || typeof raw !== 'object') {
            return { id: '', name: '' } as Company;
        }
        const record = raw as Record<string, unknown>;
        const nestedCandidate = (record['company'] as unknown) ??
            (record['currentCompany'] as unknown) ??
            (record['item'] as unknown);
        if (nestedCandidate && typeof nestedCandidate === 'object') {
            return this.normalizeCompany(nestedCandidate);
        }
        const nameRaw = (typeof record['name'] === 'string' && record['name']) ||
            (typeof record['companyName'] === 'string' && record['companyName']) ||
            '';
        const idRaw = (typeof record['id'] === 'string' && record['id']) ||
            (typeof record['companyId'] === 'string' && record['companyId']) ||
            '';
        return {
            ...(record as Partial<Company>),
            id: idRaw,
            name: nameRaw,
        } as Company;
    }
}
