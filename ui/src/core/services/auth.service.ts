import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'auth_user';

  // Base-URL for backend API (for future production use)
  // private readonly apiUrl = 'http://localhost:8080';

  constructor(
    private router: Router,
    // private http: HttpClient
  ) {}

  /**
   * Local mock login (simulates backend + Supabase-style user/token response).
   */
  login(email: string, password: string): Observable<{ token: string; user: any }> {
    console.log('Mock login with:', email, password);

    return of({
      token: this.generateMockToken(email),
      user: {
        id: 1,
        email,
        name: 'Test User'
      }
    }).pipe(
      delay(1000), // simulate latency
      tap(response => {
        this.setToken(response.token);
        this.setUser(response.user);
      })
    );

    /*
    // Production login via backend
    return this.http.post<{ token: string; user: any }>(
      `${this.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setUser(response.user);
      })
    );
    */
  }

  /**
   * Mock JWT token generator – base64-encoded payload (not cryptographically signed).
   */
  private generateMockToken(email: string): string {
    const payload = {
      sub: '1',
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    };
    return btoa(JSON.stringify(payload));
  }

  /**
   * Store token in localStorage.
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Get token from localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Store user object in localStorage.
   */
  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user object from localStorage.
   */
  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Check if token exists.
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Logout: clear token & user, navigate to login.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  /*
  // Future Supabase/Auth0 or backend-based methods can go here:

  // Supabase-style async signIn (not implemented)
  // signIn(email: string): Promise<void> {
  //   // Implement Supabase sign-in
  // }

  // Auth0-style redirect login (placeholder)
  // loginWithRedirect(): void {
  //   // e.g., redirect to Auth0 login page
  // }
  */
}
