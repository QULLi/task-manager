import { Injectable } from '@angular/core';

/** Task model used throughout the app */
export interface ITask {
  id: number;
  title: string;
  description: string;
  due_date?: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: ITask[] = [];

  constructor() {
    // Populate mock data on service instantiation
    this.seedMockData();
  }

  /** Return a copy of current mock tasks */
  getTasks(): ITask[] {
    return [...this.tasks];
  }

  /** Add a new mock task */
  addTask(task: ITask): void {
    this.tasks.push(task);
  }

  /** Remove a task by its ID */
  removeTask(id: number): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
  }

  /** Populate the in-memory task list with healthcare staffing mock data */
  private seedMockData(): void {
    const today = new Date();
    this.tasks = [
      {
        id: 1,
        title: 'Radiology Nurse – 3-day assignment',
        description: 'Temporary placement at Radiology Unit, St. Erik Hospital. Assist with CT and MRI imaging, start: tomorrow.',
        due_date: this.formatDate(this.addDays(today, 1)),
      },
      {
        id: 2,
        title: 'Assistant Nurse – Night shift coverage',
        description: 'Night shift coverage at Acute Geriatrics, Östra Regional Hospital. Responsible for basic care and vitals.',
        due_date: this.formatDate(this.addDays(today, 0)),
      },
      {
        id: 3,
        title: 'Medical Doctor – Weekend ER standby',
        description: 'Weekend coverage at Emergency Department, NorthCare Medical. General internal medicine responsibilities.',
        due_date: this.formatDate(this.addDays(today, 2)),
      },
      {
        id: 4,
        title: 'Physiotherapist – Rehab ward consultation',
        description: 'Consulting physiotherapist needed for orthopedic rehab patients at Danderyd Hospital. One-day assignment.',
        due_date: this.formatDate(this.addDays(today, 3)),
      },
      {
        id: 5,
        title: 'Midwife – Temporary coverage maternity unit',
        description: 'Midwife needed at Söderkliniken for routine deliveries and check-ups. Duration: 2 shifts, incl. handover.',
        due_date: this.formatDate(this.addDays(today, 4)),
      },
    ];
  }

  /** Add N days to given date */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /** Format date to YYYY-MM-DD */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
