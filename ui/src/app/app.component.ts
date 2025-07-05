import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'task-manager-ui';
  sessionUser: Session['user'] | null = null;

  constructor(
    public router: Router,
    private supabase: SupabaseService
  ) {
    this.loadInitialSession();
  }

  /**
   * Load any existing Supabase session on startup.
   */
  private async loadInitialSession(): Promise<void> {
    const session: Session | null = await this.supabase.getSession();
    this.sessionUser = session?.user ?? null;
  }

  ngOnInit(): void {
    // Subscribe to auth changes so we stay in sync
    this.supabase.authChanges((_: AuthChangeEvent, session: Session | null) => {
      const prevUserId = this.sessionUser?.id;
      this.sessionUser = session?.user ?? null;

      // If we just signed in, navigate to profile
      if (!prevUserId && session?.user) {
        this.router.navigate(['/profile']);
      }
    });
  }

  /**
   * Returns true if there is a currently authenticated user.
   */
  isAuthenticated(): boolean {
    return this.sessionUser !== null;
  }

  /**
   * Signs out via Supabase and redirects to sign-in.
   */
  signOut(): void {
    this.supabase.signOut().then(() => {
      this.sessionUser = null;
      this.router.navigate(['/signIn']);
    });
  }
}
