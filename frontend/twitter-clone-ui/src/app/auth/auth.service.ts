import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse, User } from '../core/models/models';
import { retryTransient } from '../core/retry-http.util';

const TOKEN_KEY = 'twixcy.session';
const USER_KEY = 'twixcy.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = `${environment.apiUrl}/api/auth`;
  private _user = signal<User | null>(this.readUser());
  readonly user = this._user.asReadonly();

  get token(): string | null { return localStorage.getItem(TOKEN_KEY); }
  isLoggedIn(): boolean { return !!this.token; }

  register(body: { username: string; email: string; password: string; firstName: string; lastName: string }) {
    return this.http.post<{ message: string }>(`${this.base}/register`, body).pipe(retryTransient({ method: 'POST' }));
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.base}/login`, { email, password }).pipe(
      retryTransient({ method: 'POST' }),
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        this._user.set(res.user);
      })
    );
  }

  /** Revokes the session on the server first, then clears local state. */
  logout() {
    this.http.post(`${this.base}/logout`, {}).pipe(
      retryTransient({ method: 'POST' }),
      finalize(() => { this.clear(); this.router.navigate(['/login']); })
    ).subscribe({ error: () => {} });
  }

  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  private readUser(): User | null {
    try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'); } catch { return null; }
  }
}
