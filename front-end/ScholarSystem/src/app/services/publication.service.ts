import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PublicationService {
  private baseUrl = 'http://127.0.0.1:8000/publications';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAll(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`, { headers: this.getHeaders() });
  }

  search(q: string, tag: string = ''): Observable<any> {
    let url = `${this.baseUrl}/search/?q=${q}`;
    if (tag) url += `&tag=${tag}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  create(publicationData: any, file?: File, coverImage?: File): Observable<any> {
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', publicationData.title);
    formData.append('content', publicationData.abstract);
    formData.append('domain', publicationData.domain);
    formData.append('author_name', publicationData.authorName);
    
    // Process tags - handle both string and array formats
    let tags = [];
    if (typeof publicationData.tags === 'string') {
      tags = publicationData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    } else if (Array.isArray(publicationData.tags)) {
      tags = publicationData.tags;
    }
    formData.append('tags', JSON.stringify(tags));
    
    // Add files if provided
    if (file) {
      formData.append('document', file);
    }
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }

    return this.http.post(`${this.baseUrl}/`, formData, { 
      headers: this.getHeaders() 
    });
  }

  like(publicationId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${publicationId}/like/`, {}, {
      headers: this.getHeaders()
    });
  }

  dislike(publicationId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${publicationId}/dislike/`, {}, {
      headers: this.getHeaders()
    });
  }

  comment(publicationId: number, commentData: { content: string; user: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/${publicationId}/comment/`, commentData, { 
      headers: this.getHeaders() 
    });
  }

  deleteComment(publicationId: number, commentIndex: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${publicationId}/comment/${commentIndex}/`, { 
      headers: this.getHeaders() 
    });
  }

  cleanComments(publicationId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${publicationId}/clean-comments/`, {}, { 
      headers: this.getHeaders() 
    });
  }

  cleanAllComments(): Observable<any> {
    return this.http.post(`${this.baseUrl}/clean-all-comments/`, {}, { 
      headers: this.getHeaders() 
    });
  }

  download(publicationId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${publicationId}/download/`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  delete(publicationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${publicationId}/`, {
      headers: this.getHeaders()
    });
  }

  advancedSearch(filters: { q?: string; tag?: string; domain?: string; author?: string; date?: string; sort?: string }): Observable<any> {
    let url = `${this.baseUrl}/search/?`;
    const params = [];
    if (filters.q) params.push(`q=${encodeURIComponent(filters.q)}`);
    if (filters.tag) params.push(`tag=${encodeURIComponent(filters.tag)}`);
    if (filters.domain) params.push(`domain=${encodeURIComponent(filters.domain)}`);
    if (filters.author) params.push(`author=${encodeURIComponent(filters.author)}`);
    if (filters.date) params.push(`date=${encodeURIComponent(filters.date)}`);
    if (filters.sort) params.push(`sort=${encodeURIComponent(filters.sort)}`);
    url += params.join('&');
    return this.http.get(url, { headers: this.getHeaders() });
  }
} 