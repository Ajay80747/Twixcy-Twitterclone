import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { delay, mergeMap, Observable, retryWhen, throwError, timer } from 'rxjs';

/**
 * Retries transient HTTP failures with a short exponential backoff.
 *
 * Retries only happen for:
 *   - status === 0   (DNS / CORS / TCP reset / gateway not yet listening —
 *                     the classic 'Cannot reach the server' flake)
 *   - 5xx            (server is briefly restarting)
 *
 * Non-idempotent requests (POST/PATCH/DELETE) only retry status===0 cases
 * (never 5xx, to avoid double-creating resources).
 *
 * Usage:
 *   this.http.get<Foo>(url).pipe(retryTransient(req))
 */
export function retryTransient<T>(
  req?: HttpRequest<unknown> | { method?: string } | null,
  opts?: { maxAttempts?: number; firstDelayMs?: number }
): (source: Observable<T>) => Observable<T> {
  const method      = (req as any)?.method?.toUpperCase?.() as string | undefined;
  const isIdempotent = !method || method === 'GET' || method === 'PUT' || method === 'HEAD';
  const maxAttempts = opts?.maxAttempts ?? 2;
  const firstDelay  = opts?.firstDelayMs ?? 200;

  return retryWhen<T>((attempts: Observable<unknown>) => attempts.pipe(
    mergeMap((err, i) => {
      if (i >= maxAttempts) return throwError(() => err);
      const status = (err as HttpErrorResponse).status ?? -1;
      const retryable = (status === 0) || (isIdempotent && status >= 500 && status < 600);
      if (!retryable) return throwError(() => err);
      const wait = firstDelay * Math.pow(2, i); // 200, 400 (when maxAttempts=2)
      return timer(wait);
    })
  )) as (source: Observable<T>) => Observable<T>;
}

/**
 * Tiny helper that can also be composed via `pipe()` after an observable
 * already exists in a class property context where we don't have the request.
 *
 * Safe default: retries as if the request is idempotent (GET/PUT).
 */
export function retryHttp<T>(maxAttempts = 2, firstDelayMs = 200) {
  return retryTransient<T>({ method: 'GET' }, { maxAttempts, firstDelayMs });
}
