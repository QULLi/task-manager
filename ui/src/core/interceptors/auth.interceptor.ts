import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiAuthService } from '../../app/api-auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private auth = inject(ApiAuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No client-side token in cookie-based auth; cookies are sent automatically
    return next.handle(req);
  }
}
