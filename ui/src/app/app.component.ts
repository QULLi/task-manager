import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
// import { SupabaseService } from './supabase.service';
import { AuthService } from '../core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'task-manager-ui';
  session: any = null;

  constructor(
    private router: Router,
    private authService: AuthService
    // private supabaseService: SupabaseService
  ) {
    // For mock login: retrieve the session if user is logged in
    this.session = this.authService.isLoggedIn() ? this.authService.getUser() : null;

    // Supabase version (if using Supabase backend):
    // this.session = this.supabaseService.getSession();
  }

  ngOnInit(): void {
    // Supabase version (auth change subscription):
    /*
    this.supabaseService.authChanges((_, session) => {
      this.session = session;
    });
    */

    // Update session on component init (mock)
    this.session = this.authService.isLoggedIn() ? this.authService.getUser() : null;
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  getUser(): any {
    return this.authService.getUser();
  }

  signOut(): void {
    // Perform logout using AuthService
    this.authService.logout();
    this.session = null;
    this.router.navigate(['/signIn']);

    // Supabase version:
    /*
    this.supabaseService.signOut()
      .then(() => {
        this.router.navigate(['/signIn']);
      });
    */
  }
}
