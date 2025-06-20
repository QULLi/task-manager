import { Injectable } from '@angular/core';
import { SupabaseService, IUser } from '../../app/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Retrieves the current user's profile from Supabase.
   * @returns A Promise containing the user's profile data.
   * @throws Error if the user is not signed in or if the query fails.
   */
  async getProfile(): Promise<any> {
    const user = this.supabase.getUserSync();
    if (!user) {
      throw new Error('No user is currently signed in.');
    }

    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      throw new Error('Failed to fetch profile data.');
    }

    return data;
  }
}
