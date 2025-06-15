import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
// import { IUser, SupabaseService } from '../supabase.service';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  imports: [FormsModule, NgIf]
})
export class SignInComponent {
  loading = false;

  // Bound to form input fields
  user = {
    email: '',
    password: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    // private supabaseService: SupabaseService // Placeholder for future Supabase integration
  ) {}

  /**
   * Handle form submission and attempt login
   */
  public signIn(): void {
    if (!this.user.email || !this.user.password) {
      console.error('Email and password must be provided');
      return;
    }

    this.loading = true;

    // Local/mock login (using AuthService)
    this.authService.login(this.user.email, this.user.password).subscribe({
      next: (response) => {
        this.loading = false;
        // Navigate to profile page after successful login
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Invalid login credentials:', err);
        // Optional: show user-facing error message here
      }
    });

    /*
    // Supabase-style login for future use
    this.supabaseService.signIn(this.user.email)
      .then(() => {
        this.loading = false;
        this.router.navigate(['/profile']);
      })
      .catch(err => {
        this.loading = false;
        console.error('Supabase login failed:', err);
      });
    */
  }
}
