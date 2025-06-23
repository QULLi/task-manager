import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { SupabaseService } from '../../app/supabase.service';

@Component({
  selector: 'app-sign-in-password',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './sign-in-password.component.html',
  styleUrls: ['./sign-in-password.component.scss'],
})
export class SignInPasswordComponent {
  loading = false;
  errorMessage = '';
  successMessage = '';

  user = {
    email: '',
    password: ''
  };

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  /**
   * Attempt to log in using email and password.
   */
  public async signIn(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    // Ensure both email and password have been provided
    if (!this.user.email || !this.user.password) {
      this.errorMessage = 'Email and password must be provided';
      return;
    }

    this.loading = true;
    try {
      // Call the SupabaseService method for password-based sign-in
      const { data, error } = await this.supabaseService.signInWithPassword(
        this.user.email,
        this.user.password
      );
      this.loading = false;

      if (error) {
        console.error('Supabase signInWithPassword failed:', error);
        this.errorMessage = error.message;
        return;
      }

      this.successMessage = 'Login successful!';
      // Navigate to profile on successful login
      this.router.navigate(['/profile']);
    } catch (err: any) {
      this.loading = false;
      console.error('Unexpected error during signInWithPassword:', err);
      this.errorMessage = err.message || 'An unexpected error occurred';
    }
  }
}
