import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiAuthService } from '../../app/api-auth.service';

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

  user = {
    email: ''
  };

  constructor(
    private router: Router,
    private apiAuth: ApiAuthService
  ) {}

  /**
   * Sends a magic login link to the provided email address.
   * Validates email format and displays appropriate messages.
   */
  public async signIn(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    // Validate email presence and format
    if (!this.user.email || !/\S+@\S+\.\S+/.test(this.user.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      this.loading = false;
      return;
    }

    try {
      await this.apiAuth.sendMagicLink(this.user.email);
      this.successMessage = 'A magic link has been sent to your email. Please check your inbox.';
    } catch (err: any) {
      console.error('Magic link login failed:', err);
      this.errorMessage = err?.message || 'Login failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
