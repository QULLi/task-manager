import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../app/supabase.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  loading = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Only email is needed for magic link login
  user = {
    email: ''
  };

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  /**
   * Sends a magic login link to the provided email address.
   * Displays appropriate success or error messages based on the outcome.
   */
  public async signIn(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.user.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    this.loading = true;
    try {
      const { data, error } = await this.supabaseService.signIn(this.user.email);
      this.loading = false;

      if (error) {
        console.error('Magic link login failed:', error);
        this.errorMessage = error.message || 'Login failed.';
        return;
      }

      this.successMessage = 'A magic link has been sent to your email. Please check your inbox.';
    } catch (err: any) {
      this.loading = false;
      console.error('Unexpected error during magic link login:', err);
      this.errorMessage = err.message || 'An unexpected error occurred.';
    }
  }
}
