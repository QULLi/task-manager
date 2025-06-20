import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SupabaseService } from '../../app/supabase.service';
import { Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  /**
   * Asynchronously checks Supabase session before activating the route.
   */
  async canActivate(): Promise<boolean | UrlTree> {
    const session: Session | null = await this.supabase.getSession();
    if (session?.user) {
      return true;
    }
    return this.router.parseUrl('/signIn');
  }
}