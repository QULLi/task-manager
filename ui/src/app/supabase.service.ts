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

    // Load initial session if available
    this.supabaseClient.auth.getSession().then(({ data }) => {
      this.currentSession = data.session ?? null;
    });

    // Subscribe to auth state changes and keep session updated
    this.supabaseClient.auth.onAuthStateChange((_event, session) => {
      this.currentSession = session ?? null;
    });
  }

  /**
   * Initiates a passwordless login flow by sending a magic link to the given email.
   * If the user does not exist, an account will be created automatically.
   */
  public async signIn(email: string): Promise<{
    data: { user: User | null; session: Session | null };
    error: any;
  }> {
    return this.supabaseClient.auth.signInWithOtp({ email });
  }

  /**
   * Sign in with email and password only.
   *
   * @param email Email address.
   * @param password Plaintext password.
   * @returns Auth result with `data` and `error`.
   */
  public async signInWithPassword(
    email: string,
    password: string
  ): Promise<{
    data: { user: User | null; session: Session | null };
    error: Error | null;
  }> {
    // Normalize email input by trimming whitespace and forcing lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Perform email/password login directly
    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    return { data, error: error ?? null };
  }

  /**
   * Signs out the currently authenticated user.
   */
  public async signOut(): Promise<{ error: any }> {
    return this.supabaseClient.auth.signOut();
  }

  /**
   * Retrieves the current authentication session asynchronously.
   */
  public async getSession(): Promise<Session | null> {
    const { data } = await this.supabaseClient.auth.getSession();
    return data.session;
  }

  /**
   * Retrieves the currently authenticated user asynchronously.
   */
  public async getUser(): Promise<User | null> {
    const { data } = await this.supabaseClient.auth.getUser();
    return data.user;
  }

  /**
   * Returns the currently authenticated user synchronously from cached session.
   */
  public getUserSync(): User | null {
    return this.currentSession?.user ?? null;
  }

  /**
   * Registers a callback for authentication state changes (e.g., SIGNED_IN, SIGNED_OUT).
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
   * Fetches the user's profile record from the 'profiles' table.
   * Requires the user to be authenticated.
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
   * Inserts or updates the user's profile in the 'profiles' table.
   * Requires the user to be authenticated.
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

  /**
   * Updates the currently authenticated user's password.
   *
   * @param newPassword New password to set.
   * @returns Result with error (if any).
   */
  public async updatePassword(newPassword: string): Promise<{ error: any }> {
    return this.supabaseClient.auth.updateUser({
      password: newPassword
    });
  }

  /**
   * Returns the underlying Supabase client instance.
   */
  get client(): SupabaseClient {
    return this.supabaseClient;
  }
}
