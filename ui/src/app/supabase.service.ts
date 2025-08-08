// src/app/supabase.service.ts

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
    // Initialize Supabase client: detect magic-link tokens, persist session, and auto-refresh tokens
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

    // Load any existing session from storage on startup
    this.supabaseClient.auth.getSession().then(({ data }) => {
      this.currentSession = data.session;
    });

    // Keep currentSession in sync on auth state changes
    this.supabaseClient.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        this.currentSession = session;
      }
    );
  }

  /**
   * Send magic link for passwordless login.
   */
  async signIn(email: string): Promise<{ data: { user: User | null; session: Session | null }; error: any }> {
    return this.supabaseClient.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: environment.siteUrl || window.location.origin }
    });
  }

  /**
   * Sign in with email and password.
   */
  async signInWithPassword(
    email: string,
    password: string
  ): Promise<{ data: { user: User | null; session: Session | null }; error: Error | null }> {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    return { data, error: error ?? null };
  }

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<{ error: any }> {
    return this.supabaseClient.auth.signOut();
  }

  /**
   * Get current session asynchronously.
   */
  async getSession(): Promise<Session | null> {
    const { data } = await this.supabaseClient.auth.getSession();
    return data.session;
  }

  /**
   * Get cached session synchronously.
   */
  getSessionSync(): Session | null {
    return this.currentSession;
  }

  /**
   * Get current user asynchronously.
   */
  async getUser(): Promise<User | null> {
    const { data } = await this.supabaseClient.auth.getUser();
    return data.user;
  }

  /**
   * Get cached user synchronously.
   */
  getUserSync(): User | null {
    return this.currentSession?.user ?? null;
  }

  /**
   * Register callback for auth state changes.
   */
  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void): void {
    this.supabaseClient.auth.onAuthStateChange((event, session) => {
      this.currentSession = session;
      callback(event, session);
    });
  }

  /**
   * Fetch the authenticated user’s profile record.
   */
  async getProfile(): Promise<{ data: { username: string; website: string; avatar_url: string } | null; error: any }> {
    const user = await this.getUser();
    if (!user) throw new Error('Not signed in');
    return this.supabaseClient
      .from('profiles')
      .select('username, website, avatar_url')
      .eq('id', user.id)
      .single();
  }

  /**
   * Insert or update the user’s profile record.
   */
  async updateProfile(userUpdate: IUser): Promise<{ data: any; error: any }> {
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

  /**
   * Update the authenticated user’s password.
   */
  async updatePassword(newPassword: string): Promise<{ error: any }> {
    return this.supabaseClient.auth.updateUser({ password: newPassword });
  }

  /**
   * Expose underlying Supabase client.
   */
  get client(): SupabaseClient {
    return this.supabaseClient;
  }
}
