import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Tweet, TweetComment } from '../models/models';
import { retryTransient } from '../retry-http.util';

@Injectable({ providedIn: 'root' })
export class TweetService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/tweets`;
  private comments = `${environment.apiUrl}/api/comments`;

  /** Upload a local image file. Returns { url: string }. */
  uploadImage(file: File) {
    const form = new FormData();
    form.append('file', file);
    const req = { method: 'POST' };
    return this.http.post<{ url: string }>(`${this.base}/upload-image`, form).pipe(retryTransient(req));
  }

  feed()        { return this.http.get<Tweet[]>(`${this.base}/feed`).pipe(retryTransient({ method: 'GET' })); }
  explore()     { return this.http.get<Tweet[]>(`${this.base}/explore`).pipe(retryTransient({ method: 'GET' })); }
  byUser(userId: number) {
    return this.http.get<Tweet[]>(`${this.base}/user/${userId}`).pipe(retryTransient({ method: 'GET' }));
  }
  get(id: number) { return this.http.get<Tweet>(`${this.base}/${id}`).pipe(retryTransient({ method: 'GET' })); }

  create(content: string, imageUrl?: string) {
    const req = { method: 'POST' };
    return this.http.post<Tweet>(this.base, { content, imageUrl: imageUrl || null }).pipe(retryTransient(req));
  }
  update(id: number, content: string, imageUrl?: string | null) {
    const req = { method: 'PUT' };
    return this.http.put<Tweet>(`${this.base}/${id}`, { content, imageUrl: imageUrl || null }).pipe(retryTransient(req));
  }
  delete(id: number) {
    const req = { method: 'DELETE' };
    return this.http.delete<void>(`${this.base}/${id}`).pipe(retryTransient(req));
  }
  like(id: number) {
    const req = { method: 'POST' };
    return this.http.post<Tweet>(`${this.base}/${id}/like`, {}).pipe(retryTransient(req));
  }
  unlike(id: number) {
    const req = { method: 'DELETE' };
    return this.http.delete<Tweet>(`${this.base}/${id}/like`).pipe(retryTransient(req));
  }
  listComments(tweetId: number) {
    return this.http.get<TweetComment[]>(`${this.base}/${tweetId}/comments`).pipe(retryTransient({ method: 'GET' }));
  }
  addComment(tweetId: number, content: string) {
    const req = { method: 'POST' };
    return this.http.post<TweetComment>(`${this.base}/${tweetId}/comment`, { content }).pipe(retryTransient(req));
  }
  updateComment(id: number, content: string) {
    const req = { method: 'PUT' };
    return this.http.put<TweetComment>(`${this.comments}/${id}`, { content }).pipe(retryTransient(req));
  }
  deleteComment(id: number) {
    const req = { method: 'DELETE' };
    return this.http.delete<void>(`${this.comments}/${id}`).pipe(retryTransient(req));
  }
}
