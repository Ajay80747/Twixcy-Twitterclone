import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Follow, FollowCount, FollowStatus } from '../models/models';
import { retryTransient } from '../retry-http.util';

@Injectable({ providedIn: 'root' })
export class FollowService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/follows`;

  follow(userId: number) {
    return this.http.post<Follow>(`${this.base}/${userId}`, {}).pipe(retryTransient({ method: 'POST' }));
  }
  unfollow(userId: number) {
    return this.http.delete<void>(`${this.base}/${userId}`).pipe(retryTransient({ method: 'DELETE' }));
  }
  followers(userId: number) {
    return this.http.get<Follow[]>(`${this.base}/followers/${userId}`).pipe(retryTransient({ method: 'GET' }));
  }
  following(userId: number) {
    return this.http.get<Follow[]>(`${this.base}/following/${userId}`).pipe(retryTransient({ method: 'GET' }));
  }
  status(userId: number) {
    return this.http.get<FollowStatus>(`${this.base}/status/${userId}`).pipe(retryTransient({ method: 'GET' }));
  }
  counts(userId: number) {
    return this.http.get<FollowCount>(`${this.base}/count/${userId}`).pipe(retryTransient({ method: 'GET' }));
  }
}
