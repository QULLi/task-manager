import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TaskService, ITask } from '../../../core/services/task.service';
import { TaskListComponent } from '../../task-list/task-list.component';

@Component({
  selector: 'app-task-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    TaskListComponent
  ],
  templateUrl: './task-page.component.html',
  styleUrls: ['./task-page.component.css'],
})
export class TaskPageComponent implements OnInit {
  /** Reference to child TaskListComponent to trigger reload */
  @ViewChild(TaskListComponent) listComponent!: TaskListComponent;

  /** Model for the new task form */
  newTask: Partial<ITask> = { title: '', description: '', due_date: '' };

  /** UI feedback state */
  formError = '';
  formSuccess = '';
  taskLoading = false;

  /** dagens datum för minsta valbara datum */
  today: string = new Date().toISOString().split('T')[0];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    // nothing to initialize here
  }

  /**
   * Adds a new task and immediately refreshes the task list.
   */
  public addTask(form: NgForm) {
    this.formError = '';
    this.formSuccess = '';

    // Validering
    if (!this.newTask.title?.trim()) {
      this.formError = 'Title is required.';
      return;
    }
    if (!this.newTask.description?.trim()) {
      this.formError = 'Description is required.';
      return;
    }
    if (!this.newTask.due_date) {
      this.formError = 'Due date is required.';
      return;
    }
    if (new Date(this.newTask.due_date) < new Date(this.today)) {
      this.formError = 'Due date cannot be in the past.';
      return;
    }

    this.taskLoading = true;

    this.taskService.createTask({
      title: this.newTask.title!.trim(),
      description: this.newTask.description!.trim(),
      due_date: this.newTask.due_date
    }).subscribe({
      next: () => {
        // Show success, reset the form
        this.formSuccess = 'Task added successfully!';
        form.resetForm({ title: '', description: '', due_date: '' });

        // Trigger child component to reload its table
        this.listComponent.loadTasks();

        // Clear success message after a delay
        setTimeout(() => {
          this.formSuccess = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to add task:', err);
        this.formError = err.message || 'Failed to add task.';
      },
      complete: () => {
        this.taskLoading = false;
      }
    });
  }
}
