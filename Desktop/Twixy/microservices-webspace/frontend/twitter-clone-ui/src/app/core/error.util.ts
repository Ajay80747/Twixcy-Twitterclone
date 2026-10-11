import { HttpErrorResponse } from '@angular/common/http';

/**
 * Converts an arbitrary thrown error (typically HttpErrorResponse) into a
 * human-readable message. The returned strings are intentionally calm and
 * actionable — we avoid accusing the gateway of being "down" on a single
 * transient TCP reset (status=0) because our retry-HTTP layer already
 * retried 2x before surfacing this call-site failure.
 */
export function errorMessage(e: unknown): string {
  if (e instanceof HttpErrorResponse) {
    // status === 0 means we couldn't get a response at all: DNS, TCP reset,
    // CORS, or gateway not listening yet. Our retry layer retried twice.
    if (e.status === 0) {
      return 'Lost connection to the server. Retrying… if this keeps happening, make sure the API gateway is running on port 8080.';
    }

    // Specific actionable help for when the user uploaded an image but the
    // upload controllers aren't yet in the running JVM (happens every time
    // we add new controllers but they haven't restarted).
    if (e.status === 405 && e.url && e.url.includes('/upload-')) {
      return 'The upload endpoint is not yet available — restart your backend services (customer-service + gateway) to pick up the new controllers.';
    }

    // Common status-code shortcuts
    switch (e.status) {
      case 400:
        return e.error?.message || 'That request looks invalid on our side. Please try again.';
      case 401:
        return e.error?.message || 'Your session expired. Please log in again.';
      case 403:
        return e.error?.message || 'You do not have permission to do that.';
      case 404:
        return e.error?.message || 'That content is no longer available.';
      case 409:
        return e.error?.message || 'This looks like a duplicate. Please try something different.';
      case 413:
        return 'That file is too large to upload.';
      case 415:
        return 'That file type is not supported.';
      case 422:
        return e.error?.message || 'There was a validation problem with your input.';
      case 429:
        return 'You are doing that too quickly — please wait a moment and try again.';
      default:
        if (e.status >= 500) {
          return `Temporary server issue (status ${e.status}). Please try again in a moment.`;
        }
    }
    return e.error?.message || 'Something went wrong';
  }
  if (e && typeof (e as any).message === 'string') return (e as any).message as string;
  return 'Something went wrong';
}
