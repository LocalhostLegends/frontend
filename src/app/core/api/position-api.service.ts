import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Position } from '@app/core/models/position.model';
import { ApiResponse } from './api-types';
@Injectable({ providedIn: 'root' })
export class PositionApiService {
    private http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/positions`;
    getPositions(): Observable<Position[]> {
        return this.http
            .get<Position[] | ApiResponse<Position[]>>(this.baseUrl)
            .pipe(map((body) => this.unwrapArray(body)));
    }
    getPosition(id: string): Observable<Position> {
        return this.http
            .get<Position | ApiResponse<Position>>(`${this.baseUrl}/${id}`)
            .pipe(map((body) => this.unwrapOne(body)));
    }
    createPosition(body: Partial<Position>): Observable<Position> {
        return this.http
            .post<Position | ApiResponse<Position>>(this.baseUrl, body)
            .pipe(map((body) => this.unwrapOne(body)));
    }
    updatePosition(id: string, body: Partial<Position>): Observable<Position> {
        return this.http
            .patch<Position | ApiResponse<Position>>(`${this.baseUrl}/${id}`, body)
            .pipe(map((body) => this.unwrapOne(body)));
    }
    deletePosition(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
    private unwrapArray(body: Position[] | ApiResponse<Position[]> | unknown): Position[] {
        if (Array.isArray(body)) {
            return body;
        }
        if (body && typeof body === 'object' && 'data' in body) {
            const data = (body as ApiResponse<Position[]>).data;
            return Array.isArray(data) ? data : [];
        }
        return [];
    }
    private unwrapOne(body: Position | ApiResponse<Position> | unknown): Position {
        if (body && typeof body === 'object' && 'data' in body) {
            return (body as ApiResponse<Position>).data;
        }
        return body as Position;
    }
}
