import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  AuthChangeEvent,
  Session,
  User
} from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../app/supabase.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private http: HttpClient
  ) {}

  /**
   * Send magic link (OTP). Returns the session (if created) or error.
   */
  loginWithMagicLink(email: string): Observable<Session | null> {
    return from(this.supabase.signIn(email)).pipe(
      tap(({ error }) => {
        if (error) throw error;
      }),
      map(response => response.data.session as Session | null)
    );
  }

  /**
   * Sign in with email + password. After successful login, sync profile to backend.
   */
  loginWithPassword(email: string, password: string): Observable<Session> {
    return from(this.supabase.signInWithPassword(email, password)).pipe(
      tap(({ error, data }) => {
        if (error) throw error;
        if (!data?.session) throw new Error('No session returned from Supabase');
      }),
      // Use switchMap to handle the async profile sync and emit only Session
      // Import switchMap from 'rxjs/operators' if not already imported
      // Replace map(async ...) and subsequent map with switchMap
      // Remove the flattening logic
      // The caller will always receive Observable<Session>
      // Add import: import { switchMap } from 'rxjs/operators';
      switchMap(async ({ data }) => {
        const session = data.session as Session;
        const user = session.user;
        if (user) {
          const body = {
            id: user.id,
            email: user.email,
            username: user.user_metadata?.['full_name'] ?? user.email,
            avatar_url: user.user_metadata?.['avatar_url'] ?? null
          };
          await this.http.post(`${environment.apiUrl}/profiles/sync`, body).toPromise();
        }
        return session;
      }),
      // Convert the Promise<Session> to Observable<Session>
      switchMap(sessionPromise => from(Promise.resolve(sessionPromise)))
    );
  }

  logout(): void {
    this.supabase.signOut()
      .then(({ error }) => {
        if (error) {
          console.error('Error during sign out:', error);
        }
        this.router.navigate(['/signIn']);
      });
  }

  async isLoggedIn(): Promise<boolean> {
    const session = await this.supabase.getSession();
    return session?.user != null;
  }

  async getUser(): Promise<User | null> {
    return await this.supabase.getUser();
  }

  onAuthChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.authChanges(callback);
  }

  getToken(): string | null {
    return this.supabase.getAccessTokenSync();
  }
}
