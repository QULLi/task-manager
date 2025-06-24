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
    this.supabase.authChanges((_: AuthChangeEvent, session: Session | null) => {
      const prev = this.sessionUser?.id;
      this.sessionUser = session?.user ?? null;

      if (!prev && session?.user) {
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
      this.sessionUser = null;
      this.router.navigate(['/signIn']);
    });
  }
}
