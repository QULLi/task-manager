import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, filter, take } from 'rxjs';
import { ApiAuthService } from '../../app/api-auth.service';

@Component({
  selector: 'app-sign-in-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './sign-in-password.component.html',
  styleUrls: ['./sign-in-password.component.css'],
})
export class SignInPasswordComponent implements OnDestroy {
  loading = false;
  errorMessage = '';
  successMessage = '';

  user = {
    email: '',
    password: ''
  };

  private readonly _destroy$ = new Subject<void>();
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly MIN_PASSWORD_LENGTH = 8;

  constructor(
    private router: Router,
    private apiAuth: ApiAuthService
  ) {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Attempt to sign in using email and password with proper validation.
   */
  public async signIn(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const validationError = this.validateInput();
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.loading = true;
    try {
      const normalizedEmail = this.user.email.trim().toLowerCase();
      await this.apiAuth.loginWithPassword(normalizedEmail, this.user.password);
      this.successMessage = 'Login successful!';
      
      // Wait for auth state to be populated, then navigate
      this.apiAuth.authState$
        .pipe(
          filter(profile => profile !== null),
          take(1),
          takeUntil(this._destroy$)
        )
        .subscribe({
          next: () => {
            this.navigateToProfile();
          },
          error: () => {
            this.errorMessage = 'Navigation failed. Please try again.';
            this.loading = false;
          }
        });
    } catch (err: any) {
      this.errorMessage = this.extractErrorMessage(err);
      this.loading = false;
    }
  }

  private validateInput(): string | null {
    const email = this.user.email?.trim();
    const password = this.user.password?.trim();

    if (!email || !password) {
      return 'Email and password must be provided';
    }

    if (!this.EMAIL_REGEX.test(email)) {
      return 'Please enter a valid email address';
    }

    if (password.length < this.MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`;
    }

    return null;
  }

  private extractErrorMessage(err: any): string {
    if (!err) return 'An unknown error occurred';
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    if (err.error?.message) return err.error.message;
    return 'Login failed. Please check your credentials and try again.';
  }

  private navigateToProfile(): void {
    this.router.navigate(['/profile']).then(
      (success) => {
        if (success) {
          this.loading = false;
        } else {
          this.errorMessage = 'Navigation failed. Please try again.';
          this.loading = false;
        }
      }
    ).catch(() => {
      this.errorMessage = 'Navigation failed. Please try again.';
      this.loading = false;
    });
  }
}