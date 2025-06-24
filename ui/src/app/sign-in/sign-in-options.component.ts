import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-in-options',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sign-in-options.component.html',
  styleUrls: ['./sign-in-options.component.css']
})
export class SignInOptionsComponent {
  constructor(private router: Router) {}

  /**
   * Navigate to password login page.
   */
  goToPasswordLogin(): void {
    this.router.navigate(['/signIn-password']);
  }

  /**
   * Navigate to OTP (magic link) login page.
   */
  goToOtpLogin(): void {
    this.router.navigate(['/signIn-otp']);
  }
}
