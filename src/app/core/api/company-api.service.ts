import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Company } from '../models/company.model';
import { ApiResponse } from './api-types';

/** Тіло POST /companies/{id}/subscription — уточніть у бекенду (planId, status тощо). */
export type CompanySubscriptionPayload = Record<string, unknown>;

/** Статистика компанії — форма залежить від API. */
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
      return (body as ApiResponse<Company>).data;
    }
    return body as Company;
  }

  private unwrapStats(body: CompanyStats | ApiResponse<CompanyStats> | unknown): CompanyStats {
    if (body && typeof body === 'object' && 'data' in body) {
      return (body as ApiResponse<CompanyStats>).data as CompanyStats;
    }
    return body as CompanyStats;
  }
}
