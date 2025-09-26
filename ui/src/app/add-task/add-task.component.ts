import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';

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

  // dagens datum för minsta valbara datum
  today: string = new Date().toISOString().split('T')[0];

  constructor(private taskService: TaskService) {}

  /**
   * Called when the form is submitted.
   * Inserts a new task via API.
   */
  public createTask(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validering: title, description och due_date krävs
    if (!this.task.title.trim()) {
      this.errorMessage = 'Title is required.';
      return;
    }
    if (!this.task.description.trim()) {
      this.errorMessage = 'Description is required.';
      return;
    }
    if (!this.task.due_date) {
      this.errorMessage = 'Due date is required.';
      return;
    }

    // Kontrollera att datum inte är bakåt i tiden
    if (new Date(this.task.due_date) < new Date(this.today)) {
      this.errorMessage = 'Due date cannot be in the past.';
      return;
    }

    this.loading = true;

    this.taskService.createTask({
      title: this.task.title.trim(),
      description: this.task.description.trim(),
      due_date: this.task.due_date
    }).subscribe({
      next: () => {
        this.successMessage = 'Task created successfully!';
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to create task:', err);
        this.errorMessage = err.message || 'Failed to create task.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Resets the form fields after a successful creation.
   */
  private resetForm(): void {
    this.task = { title: '', description: '', due_date: '' };
  }
}
