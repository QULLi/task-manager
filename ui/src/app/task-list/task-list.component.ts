import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { MatTableModule }         from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort }         from '@angular/material/sort';
import { MatButtonModule }        from '@angular/material/button';
import { MatIconModule }          from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource }     from '@angular/material/table';

import { TaskService, ITask }     from '../../core/services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  /** In-memory table data source */
  dataSource = new MatTableDataSource<ITask>([]);
  /** Columns to show in the Material table */
  displayedColumns = ['title', 'description', 'due_date', 'actions'];

  loading = false;
  error = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  /** Load tasks from in-memory service into the table */
  private loadTasks() {
    this.loading = true;
    // simulate async latency
    setTimeout(() => {
      const tasks = this.taskService.getTasks();
      this.dataSource.data = tasks;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading = false;
    }, 200);
  }

  /**
   * Remove a task in-memory and refresh table.
   */
  public deleteTask(id: number) {
    this.taskService.removeTask(id);
    this.loadTasks();
  }
}
