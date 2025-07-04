import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService, ITask } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-page.component.html',
  styleUrls: ['./task-page.component.css'],
})
export class TaskPageComponent implements OnInit {
  /** Current list of tasks in memory */
  tasks: ITask[] = [];

  /** Model for the new task form */
  newTask: Partial<ITask> = { title: '', description: '', due_date: '' };

  /** UI feedback state */
  formError = '';
  formSuccess = '';
  taskLoading = false;

  constructor(private taskService: TaskService) {}

  /**
   * On init, load the current mock tasks.
   */
  ngOnInit(): void {
    this.loadTasks();
  }

  /**
   * Load tasks from the in-memory TaskService.
   */
  private loadTasks() {
    this.tasks = this.taskService.getTasks();
  }

  /**
   * Adds a new task to the in-memory service.
   * Resets the form, reloads list and shows feedback.
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

      this.formSuccess = 'Task added successfully!';
      this.clearForm(form);
      this.loadTasks();
      this.taskLoading = false;
      this.clearMessagesAfterDelay();
    }, 300);
  }

  /**
   * Removes a task by ID via the service, reloads list and shows feedback.
   */
  public removeTask(id: number) {
    this.taskService.removeTask(id);
    this.loadTasks();
    this.formSuccess = 'Task removed successfully!';
    this.clearMessagesAfterDelay();
  }

  /**
   * Clears the add-task form and resets validation state.
   */
  private clearForm(form: NgForm) {
    this.newTask = { title: '', description: '', due_date: '' };
    form.resetForm(this.newTask);
  }

  /**
   * Clears success and error messages after a short delay.
   */
  private clearMessagesAfterDelay() {
    setTimeout(() => {
      this.formError = '';
      this.formSuccess = '';
    }, 3000);
  }
}
