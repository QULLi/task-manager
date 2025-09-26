import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { ApiAuthService } from '../../app/api-auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: ApiAuthService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    if (this.auth.isLoggedIn()) return true;
    return this.router.parseUrl('/signIn');
  }
}
