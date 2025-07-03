import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../supabase.service';

interface ITask {
  title: string;
  description: string;
  due_date?: string;
}

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent {
  loading = false;
  errorMessage = '';
  successMessage = '';

  task: ITask = {
    title: '',
    description: '',
    due_date: ''
  };

  constructor(private supabase: SupabaseService) {}

  /**
   * Called when the form is submitted.
   * Inserts a new task via Supabase (or your future API).
   */
  public async createTask(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.task.title.trim()) {
      this.errorMessage = 'Title is required.';
      return;
    }

    this.loading = true;
    try {
      // TODO: Adapt this to call the 'Tasks API' endpoint when available
      const { data, error } = await this.supabase.client
        .from('tasks')
        .insert([{
          title: this.task.title.trim(),
          description: this.task.description.trim(),
          due_date: this.task.due_date || null
        }]);

      if (error) {
        console.error('Failed to create task:', error);
        this.errorMessage = error.message;
      } else {
        this.successMessage = 'Task created successfully!';
        this.resetForm();
      }
    } catch (err: any) {
      console.error('Unexpected error during createTask:', err);
      this.errorMessage = 'An unexpected error occurred.';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Resets the form fields after a successful creation.
   */
  private resetForm(): void {
    this.task = { title: '', description: '', due_date: '' };
  }
}
