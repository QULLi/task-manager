import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface IUser {
  email?: string;
  name?: string;
  website?: string;
  url?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class ProfileComponent implements OnInit {

  loading: boolean = false;
  user: IUser = {};

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Get user info from mock AuthService
    const loggedInUser = this.authService.getUser();
    if (loggedInUser) {
      this.user.email = loggedInUser.email;
      this.user.name = loggedInUser.name;
      // Mock: website & url can be empty or preset
      this.user.website = '';
      this.user.url = '';
    }

    // Supabase version (commented out):
    /*
    const session = this.supabaseService.getSession();
    if (session && session.user && session.user.email) {
      this.user.email = session.user.email;
    }
    this.supabaseService.getProfile()
      .then((success: any) => {
        if (success && success.profile) {
          this.user.name = success.profile.username;
          this.user.website = success.profile.website;
          this.user.url = success.profile.avatar_url;
        }
      });
    */
  }

  update(): void {
    this.loading = true;

    // Mock update logic: just simulate delay and reset loading
    setTimeout(() => {
      console.log('Mock profile updated:', this.user);
      this.loading = false;
    }, 1000);

    // Supabase version (commented out):
    /*
    this.supabaseService.updateProfile(this.user)
      .then(() => {
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    */
  }
}
