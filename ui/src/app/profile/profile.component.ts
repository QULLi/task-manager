import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule }    from '@angular/router';
import { SupabaseService, IUser } from '../../app/supabase.service';

interface ITask {
  title: string;
  description: string;
  due_date?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  user: IUser = {
    email: '',
    name: '',
    website: '',
    url: ''
  };

  // For changing password
  newPassword: string = '';

  // For adding a new task
  task: ITask = { title: '', description: '', due_date: '' };
  taskLoading = false;
  taskError: string = '';
  taskSuccess: string = '';

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Loads the current authenticated user's profile data.
   */
  public async ngOnInit(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const user = await this.supabaseService.getUser();
      if (!user || !user.email) {
        this.errorMessage = 'No user is currently logged in.';
        return;
      }

      this.user.email = user.email;

      const { data, error } = await this.supabaseService.getProfile();
      if (error) {
        this.errorMessage = 'Failed to load profile: ' + error.message;
      } else if (data) {
        this.user.name = data.username || '';
        this.user.website = data.website || '';
        this.user.url = data.avatar_url || '';
      }
    } catch (err: any) {
      console.error('Unexpected error while loading profile:', err);
      this.errorMessage = 'An unexpected error occurred.';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Updates the user's profile data.
   */
  public async update(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const { error } = await this.supabaseService.updateProfile(this.user);
      if (error) {
        this.errorMessage = 'Failed to update profile: ' + error.message;
      } else {
        this.successMessage = 'Profile updated successfully!';
        this.clearMessagesAfterDelay();
      }
    } catch (err: any) {
      console.error('Unexpected error during profile update:', err);
      this.errorMessage = 'An unexpected error occurred while updating.';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Updates the authenticated user's password.
   */
  public async changePassword(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.newPassword) {
      this.errorMessage = 'Password must be provided.';
      this.loading = false;
      return;
    }

    try {
      const { error } = await this.supabaseService.updatePassword(this.newPassword);
      if (error) {
        this.errorMessage = 'Failed to update password: ' + error.message;
      } else {
        this.successMessage = 'Password updated successfully!';
        this.newPassword = '';
        this.clearMessagesAfterDelay();
      }
    } catch (err: any) {
      console.error('Unexpected error during password update:', err);
      this.errorMessage = 'An unexpected error occurred while updating password.';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Creates a new task for the authenticated user.
   */
  public async createTask(): Promise<void> {
    this.taskError = '';
    this.taskSuccess = '';

    if (!this.task.title.trim()) {
      this.taskError = 'Task title is required.';
      return;
    }

    this.taskLoading = true;
    try {
      // Insert the new task into 'tasks' table
      const { error } = await this.supabaseService.client
        .from('tasks')
        .insert([{
          title: this.task.title.trim(),
          description: this.task.description.trim(),
          due_date: this.task.due_date || null
        }]);

      if (error) {
        console.error('Failed to create task:', error);
        this.taskError = error.message;
      } else {
        this.taskSuccess = 'Task created successfully!';
        this.resetTaskForm();
      }
    } catch (err: any) {
      console.error('Unexpected error during task creation:', err);
      this.taskError = 'An unexpected error occurred.';
    } finally {
      this.taskLoading = false;
    }
  }

  /**
   * Signs out the user and reloads the page.
   */
  public async signOut(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    try {
      const { error } = await this.supabaseService.signOut();
      if (error) {
        this.errorMessage = 'Failed to sign out: ' + error.message;
      } else {
        location.reload(); // Simple full reload
      }
    } catch (err: any) {
      console.error('Unexpected error during sign-out:', err);
      this.errorMessage = 'An unexpected error occurred while signing out.';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Resets task form fields after successful creation.
   */
  private resetTaskForm(): void {
    this.task = { title: '', description: '', due_date: '' };
  }

  /**
   * Clears error and success messages after a short delay.
   */
  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.errorMessage = null;
      this.successMessage = null;
      this.taskError = '';
      this.taskSuccess = '';
    }, 5000);
  }
}
