import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private baseUrl = 'http://127.0.0.1:8000/documents';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders();
  }

  getAll(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`, { headers: this.getHeaders() });
  }

  advancedSearch(filters: { q?: string; tag?: string; domain?: string; author?: string; date?: string }): Observable<any> {
    let url = `${this.baseUrl}/search/?`;
    const params = [];
    if (filters.q) params.push(`q=${encodeURIComponent(filters.q)}`);
    if (filters.tag) params.push(`tag=${encodeURIComponent(filters.tag)}`);
    if (filters.domain) params.push(`domain=${encodeURIComponent(filters.domain)}`);
    if (filters.author) params.push(`author=${encodeURIComponent(filters.author)}`);
    if (filters.date) params.push(`date=${encodeURIComponent(filters.date)}`);
    url += params.join('&');
    return this.http.get(url, { headers: this.getHeaders() });
  }
} 