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

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabaseClient: SupabaseClient;
  private currentSession: Session | null = null;

  constructor() {
    this.supabaseClient = createClient(
      environment.supabase.url,
      environment.supabase.key,
      {
        auth: {
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true
        }
      }
    );

    // Load existing session on startup
    this.supabaseClient.auth.getSession().then(({ data }) => {
      this.currentSession = data.session;
    });

    // Keep currentSession in sync on auth changes
    this.supabaseClient.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        this.currentSession = session;
      }
    );
  }

  async signIn(email: string) {
    // magic link (OTP)
    return this.supabaseClient.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: environment.siteUrl || window.location.origin }
    });
  }

  async signInWithPassword(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    return { data, error: error ?? null };
  }

  async signOut() {
    return this.supabaseClient.auth.signOut();
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.supabaseClient.auth.getSession();
    return data.session;
  }

  getSessionSync(): Session | null {
    return this.currentSession;
  }

  async getUser(): Promise<User | null> {
    const { data } = await this.supabaseClient.auth.getUser();
    return data.user;
  }

  getUserSync(): User | null {
    return this.currentSession?.user ?? null;
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void): void {
    this.supabaseClient.auth.onAuthStateChange((event, session) => {
      this.currentSession = session;
      callback(event, session);
    });
  }

  async getProfile() {
    const user = await this.getUser();
    if (!user) throw new Error('Not signed in');
    return this.supabaseClient
      .from('profiles')
      .select('username, website, avatar_url')
      .eq('id', user.id)
      .single();
  }

  async updateProfile(userUpdate: IUser) {
    const user = await this.getUser();
    if (!user) throw new Error('Not signed in');
    const payload = {
      id: user.id,
      username: userUpdate.name,
      website: userUpdate.website,
      avatar_url: userUpdate.url,
      updated_at: new Date().toISOString()
    };
    return this.supabaseClient.from('profiles').upsert(payload);
  }

  async updatePassword(newPassword: string) {
    return this.supabaseClient.auth.updateUser({ password: newPassword });
  }

  get client(): SupabaseClient {
    return this.supabaseClient;
  }

  /**
   * Returns the current access token synchronously (from cached session).
   * Use this for Authorization header when calling backend.
   */
  getAccessTokenSync(): string | null {
    return this.currentSession?.access_token ?? null;
  }
}
