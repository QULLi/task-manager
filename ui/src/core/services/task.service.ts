import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ITask {
  id: string;
  title: string;
  description?: string;
  due_date?: string; // 'YYYY-MM-DD'
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}

  getTasks() {
    return this.http.get<ITask[]>(`${environment.apiUrl}/tasks`, { withCredentials: true });
  }

  createTask(dto: Partial<ITask>) {
    return this.http.post<ITask>(`${environment.apiUrl}/tasks`, dto, { withCredentials: true });
  }

  updateTask(id: string, dto: Partial<ITask>) {
    return this.http.put<ITask>(`${environment.apiUrl}/tasks/${encodeURIComponent(id)}`, dto, { withCredentials: true });
  }

  deleteTask(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/tasks/${encodeURIComponent(id)}`, { withCredentials: true });
  }
}
