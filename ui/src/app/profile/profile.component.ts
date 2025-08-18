import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService, IUser } from '../../app/supabase.service';

interface ITask {
  title: string;
  description: string;
  due_date?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  user: IUser = { email: '', name: '', website: '', url: '' };
  newPassword = '';
  task: ITask = { title: '', description: '', due_date: '' };
  taskLoading = false;
  taskError = '';
  taskSuccess = '';

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    try {
      const user = await this.supabaseService.getUser();
      if (!user?.email) {
        this.errorMessage = 'No user is currently logged in.';
        return;
      }
      this.user.email = user.email;

      const { data, error } = await this.supabaseService.getProfile();
      if (error) throw error;
      if (data) {
        this.user.name = data.username || '';
        this.user.website = data.website || '';
        this.user.url = data.avatar_url || '';
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      this.errorMessage = err.message || 'Failed to load profile.';
    } finally {
      this.loading = false;
    }
  }

  async update(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const { error } = await this.supabaseService.updateProfile(this.user);
      if (error) throw error;
      this.successMessage = 'Profile updated successfully!';
      this.cdr.detectChanges();
      this.clearMessagesAfterDelay();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      this.errorMessage = err.message || 'Failed to update profile.';
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
    }
  }

  async changePassword(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.newPassword.trim()) {
      this.errorMessage = 'Password must be provided.';
      this.cdr.detectChanges();
      this.loading = false;
      return;
    }

    try {
      const { error } = await this.supabaseService.updatePassword(this.newPassword);
      if (error) throw error;
      this.successMessage = 'Password updated successfully!';
      this.newPassword = '';
      this.cdr.detectChanges();
      this.clearMessagesAfterDelay();
    } catch (err: any) {
      console.error('Error changing password:', err);
      this.errorMessage = err.message || 'Failed to update password.';
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
    }
  }

  async createTask(): Promise<void> {
    this.taskError = '';
    this.taskSuccess = '';

    if (!this.task.title.trim()) {
      this.taskError = 'Task title is required.';
      this.cdr.detectChanges();
      return;
    }

    this.taskLoading = true;
    try {
      const { error } = await this.supabaseService.client
        .from('tasks')
        .insert([{
          title: this.task.title.trim(),
          description: this.task.description.trim(),
          due_date: this.task.due_date || null
        }]);
      if (error) throw error;
      this.taskSuccess = 'Task created successfully!';
      this.resetTaskForm();
      this.cdr.detectChanges();
    } catch (err: any) {
      console.error('Error creating task:', err);
      this.taskError = err.message || 'Failed to create task.';
      this.cdr.detectChanges();
    } finally {
      this.taskLoading = false;
    }
  }

  async signOut(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;

    try {
      const { error } = await this.supabaseService.signOut();
      if (error) throw error;
      location.reload();
    } catch (err: any) {
      console.error('Error signing out:', err);
      this.errorMessage = err.message || 'Failed to sign out.';
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
    }
  }

  private resetTaskForm(): void {
    this.task = { title: '', description: '', due_date: '' };
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.errorMessage = null;
      this.successMessage = null;
      this.taskError = '';
      this.taskSuccess = '';
      this.cdr.detectChanges();
    }, 5000);
  }
}
