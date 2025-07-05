import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule }                    from '@angular/common';
import { FormsModule, NgForm }            from '@angular/forms';
import { MatProgressSpinnerModule }        from '@angular/material/progress-spinner';

import { TaskService, ITask }              from '../../../core/services/task.service';
import { TaskListComponent }               from '../../task-list/task-list.component';

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

    if (!this.newTask.title?.trim()) {
      this.formError = 'Title is required.';
      return;
    }

    this.taskLoading = true;

    setTimeout(() => {
      const task: ITask = {
        id: Date.now(),
        title: this.newTask.title!.trim(),
        description: this.newTask.description?.trim() || '',
        due_date: this.newTask.due_date || undefined,
      };
      this.taskService.addTask(task);

      // Show success, reset the form
      this.formSuccess = 'Task added successfully!';
      form.resetForm({ title: '', description: '', due_date: '' });
      this.taskLoading = false;

      // Trigger child component to reload its table
      this.listComponent.loadTasks();

      // Clear success message after a delay
      setTimeout(() => {
        this.formSuccess = '';
      }, 3000);
    }, 300);
  }
}
