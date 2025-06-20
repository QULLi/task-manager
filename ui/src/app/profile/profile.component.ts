import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { SupabaseService, IUser } from '../../app/supabase.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [FormsModule, NgIf]
})
export class ProfileComponent implements OnInit {
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  user: IUser = {
    email: '',
    name: '',
    website: '',
    url: ''
  };

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Lifecycle hook that loads the current user and their profile data from Supabase.
   */
  public async ngOnInit(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const user = await this.supabaseService.getUser();
      if (!user || !user.email) {
        this.errorMessage = 'No user is currently logged in.';
        return;
      }

      this.user.email = user.email;

      const { data, error } = await this.supabaseService.getProfile();
      if (error) {
        this.errorMessage = 'Failed to load profile: ' + error.message;
      } else if (data) {
        this.user.name = data.username || '';
        this.user.website = data.website || '';
        this.user.url = data.avatar_url || '';
      }
    } catch (err: any) {
      console.error('Unexpected error while loading profile:', err);
      this.errorMessage = 'An unexpected error occurred.';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Updates the user's profile using the Supabase service.
   */
  public async update(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const { error } = await this.supabaseService.updateProfile(this.user);
      if (error) {
        this.errorMessage = 'Failed to update profile: ' + error.message;
      } else {
        this.successMessage = 'Profile updated successfully!';
        this.clearMessagesAfterDelay();
      }
    } catch (err: any) {
      console.error('Unexpected error during profile update:', err);
      this.errorMessage = 'An unexpected error occurred while updating.';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Signs out the currently authenticated user.
   * Reloads the page after successful sign-out.
   */
  public async signOut(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    try {
      const { error } = await this.supabaseService.signOut();
      if (error) {
        this.errorMessage = 'Failed to sign out: ' + error.message;
      } else {
        location.reload(); // Simple reload, or optionally use router navigation
      }
    } catch (err: any) {
      console.error('Unexpected error during sign-out:', err);
      this.errorMessage = 'An unexpected error occurred while signing out.';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Clears both success and error messages after a short delay (5 seconds).
   */
  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.errorMessage = null;
      this.successMessage = null;
    }, 5000);
  }
}
