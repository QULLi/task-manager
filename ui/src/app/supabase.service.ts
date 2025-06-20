import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient,
  Session,
  AuthChangeEvent,
  User
} from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export interface IUser {
  email: string;
  name: string;
  website: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabaseClient: SupabaseClient;
  private currentSession: Session | null = null;

  constructor() {
    this.supabaseClient = createClient(
      environment.supabase.url,
      environment.supabase.key
    );

    // Listen to auth changes and cache session
    this.supabaseClient.auth.getSession().then(({ data }) => {
      this.currentSession = data.session ?? null;
    });

    this.supabaseClient.auth.onAuthStateChange((_event, session) => {
      this.currentSession = session ?? null;
    });
  }

  /**
   * Send a magic link to the provided email for login.
   */
  public async signIn(email: string): Promise<{
    data: { user: User | null; session: Session | null };
    error: any;
  }> {
    return this.supabaseClient.auth.signInWithOtp({ email });
  }

  /**
   * Sign out the current user.
   */
  public async signOut(): Promise<{ error: any }> {
    return this.supabaseClient.auth.signOut();
  }

  /**
   * Get the current session (asynchronous).
   */
  public async getSession(): Promise<Session | null> {
    const { data } = await this.supabaseClient.auth.getSession();
    return data.session;
  }

  /**
   * Get the currently signed-in user (asynchronous).
   */
  public async getUser(): Promise<User | null> {
    const { data } = await this.supabaseClient.auth.getUser();
    return data.user;
  }

  /**
   * Get the current session synchronously, if available.
   */
  public getUserSync(): User | null {
    return this.currentSession?.user ?? null;
  }

  /**
   * Subscribe to auth state changes (SIGNED_IN, SIGNED_OUT, etc.).
   */
  public authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): void {
    this.supabaseClient.auth.onAuthStateChange((event, session) => {
      this.currentSession = session ?? null;
      callback(event, session ?? null);
    });
  }

  /**
   * Fetch the profile record for the signed-in user.
   */
  public async getProfile(): Promise<{
    data: { username: string; website: string; avatar_url: string } | null;
    error: any;
  }> {
    const user = await this.getUser();
    if (!user) {
      return { data: null, error: new Error('Not signed in') };
    }

    return this.supabaseClient
      .from('profiles')
      .select('username, website, avatar_url')
      .eq('id', user.id)
      .single();
  }

  /**
   * Upsert the profile record for the signed-in user.
   */
  public async updateProfile(userUpdate: IUser): Promise<{ data: any; error: any }> {
    const user = await this.getUser();
    if (!user) {
      return { data: null, error: new Error('Not signed in') };
    }

    const payload = {
      id: user.id,
      username: userUpdate.name,
      website: userUpdate.website,
      avatar_url: userUpdate.url,
      updated_at: new Date().toISOString(),
    };

    return this.supabaseClient
      .from('profiles')
      .upsert(payload);
  }

  get client(): SupabaseClient {
  return this.supabaseClient;
  }
}
