import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { firstValueFrom, BehaviorSubject } from 'rxjs';

/**
 * Profile shape used by the app.
 */
export interface Profile {
  id?: string;
  email?: string;
  username?: string;
  avatar_url?: string | null;
  updatedAt?: string;
}

/**
 * API auth service.
 *
 * - Keeps profile in-memory in a BehaviorSubject.
 * - Keeps last access token in-memory (not persisted) when backend returns it on login.
 * - Uses token to decode subject (UUID) client-side and fetch /profiles/{id}.
 *
 * NOTE: This implementation intentionally does NOT call /profiles/me and does not
 * attempt to read HttpOnly cookies. The backend must return an `access_token`
 * (JWT) in the login response if the frontend should fetch profile by id.
 */
@Injectable({ providedIn: 'root' })
export class ApiAuthService {
  private authStateSub = new BehaviorSubject<Profile | null>(null);
  public readonly authState$ = this.authStateSub.asObservable();

  // last access token returned by backend (in-memory only)
  private lastAccessToken: string | null = null;

  constructor(private http: HttpClient) {
    // No automatic refresh on startup because we do not support /profiles/me fallback.
    // Frontend will populate profile after a successful login (which must return access_token).
  }

  /**
   * Login using email/password. Backend is expected to set an HttpOnly cookie (optional)
   * and MUST return { access_token: "<jwt>" } in the response body if frontend needs to
   * fetch /profiles/{id}. After login, this service fetches the profile by decoding
   * the token's 'sub' claim and calling /profiles/{sub}.
   */
  async loginWithPassword(email: string, password: string): Promise<void> {
    try {
      const resp = await firstValueFrom(
        this.http.post<{ access_token?: string; [key: string]: any }>(
          `${environment.apiUrl}/auth/login`,
          { email, password },
          { withCredentials: true }
        )
      );

      if (resp && typeof resp.access_token === 'string') {
        this.lastAccessToken = resp.access_token;
        const sub = this.getSubFromJwt(resp.access_token);
        if (sub) {
          await this.fetchProfileById(sub);
          return;
        } else {
          // Token malformed or no sub claim
          throw new Error('Login succeeded but returned token missing subject (sub)');
        }
      }

      // If backend did not return an access_token, we cannot fetch profile by id.
      throw new Error('Login response did not include access_token. Backend must return access_token for id-based profile fetching.');
    } catch (err: any) {
      const msg = this.extractErrorMessage(err);
      throw new Error(msg);
    }
  }

  /**
   * Request magic link. Backend should set cookie or return token as appropriate.
   * This method does not perform profile fetching automatically.
   */
  async sendMagicLink(email: string): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/magic`, { email }, { withCredentials: true }));
    } catch (err: any) {
      throw new Error(this.extractErrorMessage(err));
    }
  }

  /**
   * Logout via backend and clear local auth state.
   */
  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }));
    } finally {
      this.lastAccessToken = null;
      this.authStateSub.next(null);
    }
  }

  /**
   * Refresh profile using stored access token.
   * Throws if no token is available.
   */
  async refreshProfile(): Promise<void> {
    if (!this.lastAccessToken) {
      throw new Error('No access token available. Cannot refresh profile without token.');
    }
    const sub = this.getSubFromJwt(this.lastAccessToken);
    if (!sub) throw new Error('Stored access token is invalid or missing subject (sub).');
    await this.fetchProfileById(sub);
  }

  /**
   * Update password for logged in user (backend endpoint must accept cookie or token)
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/change-password`, { password: newPassword }, { withCredentials: true }));
    } catch (err: any) {
      throw new Error(this.extractErrorMessage(err));
    }
  }

  isLoggedIn(): boolean {
    return this.authStateSub.value != null;
  }

  getProfileSync(): Profile | null {
    return this.authStateSub.value;
  }

  /**
   * Helper: fetch profile by UUID and update in-memory state.
   */
  private async fetchProfileById(id: string): Promise<void> {
    const profile = await firstValueFrom(this.http.get<Profile>(`${environment.apiUrl}/profiles/${encodeURIComponent(id)}`, { withCredentials: true }));
    this.authStateSub.next(profile ?? null);
  }

  /**
   * Extract 'sub' (subject) from a JWT without verifying signature.
   * Returns null if token is malformed.
   */
  private getSubFromJwt(token: string | null): string | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      const payload = parts[1];
      // base64url -> base64
      let b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      // pad
      while (b64.length % 4) b64 += '=';
      const json = atob(b64);
      const obj = JSON.parse(json);
      return (typeof obj.sub === 'string') ? obj.sub : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Normalize error message for UI components.
   */
  private extractErrorMessage(err: any): string {
    if (!err) return 'Unknown error';
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (body && typeof body === 'object') {
        if (body.message) return String(body.message);
        if (body.error) return String(body.error);
      }
      return `${err.status} ${err.statusText}` || err.message || 'Request failed';
    }
    return err.message ?? String(err);
  }
}
