import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get(`${this.baseUrl}/users`);
  }

  register(data: unknown) {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  login(data: unknown) {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  refresh(data: unknown) {
    return this.http.post(`${this.baseUrl}/auth/refresh`, data);
  }
}