import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

/** Legacy direct tweet-service URL. All traffic (including image uploads) now goes
 *  through the API gateway at environment.apiUrl. This constant remains so that any
 *  stray direct requests in development still carry the session token. */
const TWEET_SERVICE_URL = 'http://localhost:8083';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isPublic = /\/api\/auth\/(login|register)$/.test(req.url);
  const token = auth.token;

  const needsToken = token && !isPublic &&
    (req.url.startsWith(environment.apiUrl) || req.url.startsWith(TWEET_SERVICE_URL));

  const outgoing = needsToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(outgoing).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublic) {
        auth.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
