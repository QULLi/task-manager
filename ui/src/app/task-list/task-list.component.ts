import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { TaskService, ITask } from '../../core/services/task.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  dataSource = new MatTableDataSource<ITask>([]);
  displayedColumns = ['title', 'description', 'due_date', 'actions'];

  loading = false;
  error = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  public async loadTasks() {
    this.loading = true;
    this.error = '';
    try {
      const tasks = await firstValueFrom(this.taskService.getTasks());
      this.dataSource.data = tasks;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (err: any) {
      this.error = err.message || 'Failed to load tasks.';
    } finally {
      this.loading = false;
    }
  }

  /** Confirm and delete */
  public async deleteTask(id: string) {
    const result = await Swal.fire({
      title: 'Delete task?',
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await firstValueFrom(this.taskService.deleteTask(id));
        this.loadTasks();
        Swal.fire('Deleted!', 'Task has been removed.', 'success');
      } catch (err: any) {
        Swal.fire('Error', err.message || 'Failed to delete task.', 'error');
      }
    }
  }

  /** Open a popup to edit title/description/due_date */
  public async editTask(task: ITask) {
    const today = new Date().toISOString().split('T')[0];

    const { value: formValues } = await Swal.fire({
      title: 'Edit task',
      html:
        `<input id="swal-title" class="swal2-input" placeholder="Title" value="${task.title}">` +
        `<textarea id="swal-desc" class="swal2-textarea" placeholder="Description">${task.description || ''}</textarea>` +
        `<input id="swal-date" type="date" class="swal2-input" value="${task.due_date || ''}" min="${today}">`,
      focusConfirm: false,
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const description = (document.getElementById('swal-desc') as HTMLTextAreaElement).value;
        const due_date = (document.getElementById('swal-date') as HTMLInputElement).value;

        if (!title.trim()) {
          Swal.showValidationMessage('Title is required');
          return;
        }

        if (due_date) {
          const chosenDate = new Date(due_date);
          const minDate = new Date(today);
          if (chosenDate < minDate) {
            Swal.showValidationMessage('Due date cannot be before today');
            return;
          }
        }

        return { title, description, due_date };
      },
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel'
    });

    if (formValues) {
      const updated: Partial<ITask> = {
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        due_date: formValues.due_date || undefined
      };
      await firstValueFrom(this.taskService.updateTask(task.id, updated));
      this.loadTasks();
      Swal.fire('Saved!', 'Task updated.', 'success');
    }
  }
}
