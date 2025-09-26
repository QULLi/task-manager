import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interceptor that ensures requests to the API include credentials (cookies).
 * This avoids repeating { withCredentials: true } on every request.
 */
@Injectable()
export class WithCredentialsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith(environment.apiUrl)) {
      const clone = req.clone({ withCredentials: true });
      return next.handle(clone);
    }
    return next.handle(req);
  }
}
