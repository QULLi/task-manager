import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { SupabaseService } from '../../app/supabase.service';

@Component({
    selector: 'app-sign-in',
    imports: [FormsModule, NgIf],
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Only email is required for magic-link login
  user = {
    email: ''
  };

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  /**
   * Send magic link to the provided email and handle UI feedback.
   */
  public async signIn(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.user.email) {
      this.errorMessage = 'Email must be provided';
      return;
    }

    this.loading = true;
    try {
      const { data, error } = await this.supabaseService.signIn(this.user.email);
      this.loading = false;

      if (error) {
        console.error('Supabase signIn failed:', error);
        this.errorMessage = error.message;
        return;
      }

      this.successMessage = 'Magic link sent! Check your email to continue.';
    } catch (err: any) {
      this.loading = false;
      console.error('Unexpected error during signIn:', err);
      this.errorMessage = err.message || 'An unexpected error occurred';
    }
  }
}
