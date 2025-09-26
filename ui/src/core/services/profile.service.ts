import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiAuthService, Profile } from '../../app/api-auth.service';

/**
 * ProfileService
 *
 * - Prefers in-memory profile from ApiAuthService.
 * - If not present, attempts to refresh the profile via ApiAuthService.refreshProfile()
 *   (which requires an access token to be available).
 * - Also exposes direct fetch by id and update endpoints.
 */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient, private auth: ApiAuthService) {}

  /**
   * Get the current user's profile.
   * - Return cached profile if available.
   * - Otherwise attempt to refresh via ApiAuthService (requires access_token).
   * - Throws when no token is available or network error occurs.
   */
  async getProfile(): Promise<Profile | null> {
    const cached = this.auth.getProfileSync();
    if (cached) {
      return cached;
    }

    // Try to refresh (this will throw if no token is known)
    await this.auth.refreshProfile();
    return this.auth.getProfileSync();
  }

  /**
   * Fetch a profile by UUID (direct API call).
   * Useful when you already have the id (e.g. decoded from token).
   */
  async getProfileById(id: string): Promise<Profile> {
    const encoded = encodeURIComponent(id);
    return await firstValueFrom(this.http.get<Profile>(`${environment.apiUrl}/profiles/${encoded}`, { withCredentials: true }));
  }

  /**
   * Upsert profile for authenticated user.
   * Backend expects token/cookie to identify the user and will save by subject.
   */
  async updateProfile(payload: any): Promise<Profile> {
    return await firstValueFrom(this.http.post<Profile>(`${environment.apiUrl}/profiles/sync`, payload, { withCredentials: true }));
  }
}
