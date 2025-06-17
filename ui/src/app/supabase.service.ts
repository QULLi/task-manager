/**
 * Mocking before implementation of all/real supabase features
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
// import { AuthChangeEvent, createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';

export interface IUser {
  email: string;
  name: string;
  website: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  // private supabaseClient: SupabaseClient;

  constructor(private http: HttpClient) {
    // this.supabaseClient = createClient(environment.supabase.url, environment.supabase.key);
  }

  /**
   * Get current user (mocked from localStorage in local mode)
   */
  public getUser(): any {
    // return this.supabaseClient.auth.user();
    return JSON.parse(localStorage.getItem('auth_user') || 'null');
  }

  /**
   * Get current session (mocked from localStorage)
   */
  public getSession(): any {
    // return this.supabaseClient.auth.session();
    const token = localStorage.getItem('access_token');
    const user = this.getUser();
    return token && user ? { access_token: token, user } : null;
  }

  /**
   * Get user profile from local backend
   */
  public getProfile(): Promise<any> {
    const user = this.getUser();
    // return this.supabaseClient.from('profiles')
    //   .select('username, website, avatar_url')
    //   .eq('id', user?.id)
    //   .single();
    return this.http.get<any>(`${environment.apiUrl}/profile/${user.id}`).toPromise();
  }

  /**
   * Auth change listener – not available in mock
   */
  public authChanges(callback: Function): void {
    // return this.supabaseClient.auth.onAuthStateChange(callback);
    // No real-time auth in mock/local mode
  }

  /**
   * Sign in via backend, store token & user
   */
  public signIn(email: string): Promise<any> {
    // return this.supabaseClient.auth.signIn({ email });
    return this.http.post<any>(`${environment.apiUrl}/auth`, { email })
      .toPromise()
      .then(response => {
        const user = response.user;
        const token = response.token;

        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('access_token', token);

        return response;
      });
  }

  /**
   * Sign out (clear localStorage)
   */
  public signOut(): Promise<any> {
    // return this.supabaseClient.auth.signOut();
    localStorage.removeItem('auth_user');
    localStorage.removeItem('access_token');
    return Promise.resolve();
  }

  /**
   * Update user profile via backend
   */
  public updateProfile(userUpdate: IUser): Promise<any> {
    const user = this.getUser();

    const update = {
      id: user?.id,
      username: userUpdate.name,
      website: userUpdate.website,
      avatar_url: userUpdate.url,
      updated_at: new Date(),
    };

    // return this.supabaseClient.from('profiles').upsert(update, {
    //   returning: 'minimal',
    // });

    return this.http.put<any>(`${environment.apiUrl}/profile`, update).toPromise();
  }
}
