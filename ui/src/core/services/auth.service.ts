import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthChangeEvent,
  Session,
  User
} from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { SupabaseService } from '../../app/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  /**
   * Sign in user via Supabase Auth.
   * Returns an Observable that emits the user session on success.
   */
  login(email: string): Observable<Session> {
    return from(this.supabase.signIn(email)).pipe(
      tap(({ error }) => {
        if (error) {
          throw error;
        }
      }),
      map(response => response.data.session as Session)
    );
  }

  /**
   * Log out the current user and navigate to sign-in page.
   */
  logout(): void {
    this.supabase.signOut()
      .then(({ error }) => {
        if (error) {
          console.error('Error during sign out:', error);
        }
        this.router.navigate(['/signIn']);
      });
  }

  /**
   * Check if a valid session exists (i.e., user is signed in).
   */
  async isLoggedIn(): Promise<boolean> {
    const session = await this.supabase.getSession();
    return session?.user != null;
  }

  /**
   * Get the current signed-in user, or null if not authenticated.
   */
  async getUser(): Promise<User | null> {
    return await this.supabase.getUser();
  }

  /**
   * Subscribe to auth state changes (login/logout) from Supabase.
   */
  onAuthChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.authChanges(callback);
  }

    getToken(): string | null {
    return localStorage.getItem('token');
  }
}
