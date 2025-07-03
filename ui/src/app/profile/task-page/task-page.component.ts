import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface ITask {
  id: number;
  title: string;
  description: string;
  due_date?: string;
}

@Component({
  selector: 'app-task-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-page.component.html',
  styleUrls: ['./task-page.component.css'],
})
export class TaskPageComponent implements OnInit {
  tasks: ITask[] = [];
  newTask: Partial<ITask> = { title: '', description: '', due_date: '' };
  formError = '';
  formSuccess = '';
  taskLoading = false;

  constructor() {}

  ngOnInit(): void {}

  /**
   * Adds a new task, mocks API call.
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
        due_date: this.newTask.due_date || undefined
      };
      this.tasks.push(task);

      this.formSuccess = 'Task added successfully!';
      this.clearForm(form);
      this.taskLoading = false;
      this.clearMessagesAfterDelay();
    }, 300);
  }

  /**
   * Removes a task by ID and shows feedback.
   */
  public removeTask(id: number) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.formSuccess = 'Task removed successfully!';
    this.clearMessagesAfterDelay();
  }

  /**
   * Clears the add-task form and resets validation.
   */
  private clearForm(form: NgForm) {
    this.newTask = { title: '', description: '', due_date: '' };
    form.resetForm(this.newTask);
  }

  /**
   * Clears feedback messages after a delay.
   */
  private clearMessagesAfterDelay() {
    setTimeout(() => {
      this.formError = '';
      this.formSuccess = '';
    }, 3000);
  }
}
