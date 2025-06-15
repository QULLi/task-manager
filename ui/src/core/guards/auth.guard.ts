import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard checks if the user is authenticated (logged in)
 * before allowing route activation.
 * If the user is not logged in, it redirects to the /signIn page.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Determines whether a route can be activated.
   * @returns true if the user is logged in,
   * otherwise a UrlTree redirecting to /signIn.
   */
  canActivate(): boolean | UrlTree {
    const isLoggedIn = this.authService.isLoggedIn();

    if (isLoggedIn) {
      return true;
    }

    // User is not logged in, redirect to sign-in page
    return this.router.parseUrl('/signIn');
  }
}
