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

  public loadTasks() {
    this.loading = true;
    setTimeout(() => {
      const tasks = this.taskService.getTasks();
      this.dataSource.data = tasks;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading = false;
    }, 200);
  }

  /** Confirm and delete */
  public async deleteTask(id: number) {
    const result = await Swal.fire({
      title: 'Delete assignment?',
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      this.taskService.removeTask(id);
      this.loadTasks();
      Swal.fire('Deleted!', 'Assignment has been removed.', 'success');
    }
  }

  /** Open a popup to edit title/description/due_date */
  public async editTask(task: ITask) {
    const { value: formValues } = await Swal.fire({
      title: 'Edit assignment',
      html:
        `<input id="swal-title" class="swal2-input" placeholder="Title" value="${task.title}">` +
        `<textarea id="swal-desc" class="swal2-textarea" placeholder="Description">${task.description}</textarea>` +
        `<input id="swal-date" type="date" class="swal2-input" value="${task.due_date || ''}">`,
      focusConfirm: false,
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const description = (document.getElementById('swal-desc') as HTMLTextAreaElement).value;
        const due_date = (document.getElementById('swal-date') as HTMLInputElement).value;
        if (!title.trim()) {
          Swal.showValidationMessage('Title is required');
        }
        return { title, description, due_date };
      },
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel'
    });

    if (formValues) {
      const updated: ITask = {
        ...task,
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        due_date: formValues.due_date || undefined
      };
      this.taskService.updateTask(updated);
      this.loadTasks();
      Swal.fire('Saved!', 'Assignment updated.', 'success');
    }
  }
}
