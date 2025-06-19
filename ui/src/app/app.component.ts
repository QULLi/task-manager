import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { SupabaseService } from './supabase.service';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'task-manager-ui';
  sessionUser: any = null;

  constructor(
    private router: Router,
    private supabase: SupabaseService
  ) {
    // Initialize session asynchronously
    this.loadInitialSession();
  }

  /** Load existing session on startup */
  private async loadInitialSession(): Promise<void> {
    const session: Session | null = await this.supabase.getSession();
    this.sessionUser = session?.user ?? null;
  }

  ngOnInit(): void {
    // Listen for future auth changes
    this.supabase.authChanges((_: AuthChangeEvent, session: Session | null) => {
      this.sessionUser = session?.user ?? null;
      if (session?.user) {
        this.router.navigate(['/profile']);
      }
    });
  }

  /** True if a user is authenticated */
  isAuthenticated(): boolean {
    return this.sessionUser !== null;
  }

  /** Sign out and navigate to Sign-In */
  signOut(): void {
    this.supabase.signOut().then(() => {
      this.router.navigate(['/signIn']);
    });
  }
}
