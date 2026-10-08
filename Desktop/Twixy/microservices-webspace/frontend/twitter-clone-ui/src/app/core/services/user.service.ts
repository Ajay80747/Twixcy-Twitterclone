import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { User } from '../models/models';
import { retryTransient } from '../retry-http.util';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/users`;

  me() { return this.http.get<User>(`${this.base}/me`).pipe(retryTransient({ method: 'GET' })); }
  byId(id: number) { return this.http.get<User>(`${this.base}/${id}`).pipe(retryTransient({ method: 'GET' })); }
  byUsername(username: string) { return this.http.get<User>(`${this.base}/username/${encodeURIComponent(username)}`).pipe(retryTransient({ method: 'GET' })); }
  search(keyword: string) { return this.http.get<User[]>(`${this.base}/search`, { params: new HttpParams().set('keyword', keyword) }).pipe(retryTransient({ method: 'GET' })); }
  suggestions() { return this.http.get<User[]>(`${this.base}/suggestions`).pipe(retryTransient({ method: 'GET' })); }
  batch(ids: number[]) { return this.http.get<User[]>(`${this.base}/batch`, { params: new HttpParams().set('ids', ids.join(',')) }).pipe(retryTransient({ method: 'GET' })); }

  update(id: number, body: Partial<User>) {
    const req = { method: 'PUT' };
    return this.http.put<User>(`${this.base}/${id}`, body).pipe(retryTransient(req));
  }

  uploadProfileImage(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/upload-profile-image`, form).pipe(retryTransient({ method: 'POST' }));
  }

  uploadBannerImage(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/upload-banner-image`, form).pipe(retryTransient({ method: 'POST' }));
  }
}
