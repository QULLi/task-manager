import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiAuthService } from './api-auth.service';
import { Subscription } from 'rxjs';

/**
 * Root app component. Subscribes to ApiAuthService.authState$ (in-memory).
 * Navigation occurs when user logs in; state is not persisted to localStorage.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'task-manager-ui';
  sessionUser: any | null = null;
  private sub?: Subscription;

  // Use runtime inject() to avoid "type only" injection issues
  private auth = inject(ApiAuthService);

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.sub = this.auth.authState$.subscribe((user: any | null) => {
      const prevUserId = this.sessionUser?.id;
      this.sessionUser = user;
      if (!prevUserId && user) {
        // navigate to profile on new login
        this.router.navigate(['/profile']);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  isAuthenticated(): boolean {
    return this.sessionUser !== null;
  }

  async signOut(): Promise<void> {
    try {
      await this.auth.logout();
    } finally {
      this.sessionUser = null;
      this.router.navigate(['/signIn']);
    }
  }
}
