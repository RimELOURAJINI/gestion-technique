import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/models';

interface DayEntry { date: string; hours: number; description: string; taskTitle: string; }

@Component({
  selector: 'app-timesheets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timesheets.component.html',
  styleUrl: './timesheets.component.css'
})
export class TimesheetsComponent implements OnInit {
  tasks: Task[] = [];
  timeEntries: DayEntry[] = [];
  totalHours = 0;
  weekDays: { date: Date; label: string }[] = [];

  constructor(private employeeService: EmployeeService, private authService: AuthService) {}

  ngOnInit(): void {
    this.buildWeek();
    const userId = this.authService.getUserId();
    if (userId) {
      this.employeeService.getMyTasks(userId).subscribe(tasks => {
        this.tasks = tasks;
        this.buildEntries();
      });
    }
  }

  buildWeek(): void {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    this.weekDays = [];
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      this.weekDays.push({ date: d, label: dayNames[i] });
    }
  }

  buildEntries(): void {
    // Map tasks with actual start/end times to time entries
    this.timeEntries = this.tasks
      .filter(t => t.actualStartTime && t.actualEndTime)
      .map(t => {
        const start = new Date(t.actualStartTime!);
        const end = new Date(t.actualEndTime!);
        const hours = Math.round((end.getTime() - start.getTime()) / 3600000 * 10) / 10;
        return {
          date: start.toISOString().substring(0, 10),
          hours,
          description: t.description || '',
          taskTitle: t.title
        };
      });
    this.totalHours = this.timeEntries.reduce((s, e) => s + e.hours, 0);
  }

  getEntriesForDay(date: Date): DayEntry[] {
    const key = date.toISOString().substring(0, 10);
    return this.timeEntries.filter(e => e.date === key);
  }

  getHoursForDay(date: Date): number {
    return this.getEntriesForDay(date).reduce((s, e) => s + e.hours, 0);
  }
}
