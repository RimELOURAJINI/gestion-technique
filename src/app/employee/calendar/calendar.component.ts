import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/models';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  today = new Date();
  currentYear = this.today.getFullYear();
  currentMonth = this.today.getMonth();
  tasks: Task[] = [];
  calendarDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;

  monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  dayNames = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  constructor(private employeeService: EmployeeService, private authService: AuthService) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.employeeService.getMyTasks(userId).subscribe(tasks => {
        this.tasks = tasks;
        this.buildCalendar();
      });
    } else {
      this.buildCalendar();
    }
  }

  buildCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    // Start on Monday
    let startDay = (firstDay.getDay() + 6) % 7; // 0=Mon
    const days: CalendarDay[] = [];

    // Prev month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(firstDay);
      d.setDate(d.getDate() - (i + 1));
      days.push({ date: d, isCurrentMonth: false, isToday: false, tasks: this.getTasksForDate(d) });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(this.currentYear, this.currentMonth, i);
      const isToday = d.toDateString() === this.today.toDateString();
      days.push({ date: d, isCurrentMonth: true, isToday, tasks: this.getTasksForDate(d) });
    }
    // Fill to 6 rows
    let remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(lastDay);
      d.setDate(d.getDate() + i);
      days.push({ date: d, isCurrentMonth: false, isToday: false, tasks: this.getTasksForDate(d) });
    }

    this.calendarDays = days;
  }

  getTasksForDate(date: Date): Task[] {
    return this.tasks.filter(t => {
      if (!t.deadline) return false;
      const dl = new Date(t.deadline);
      return dl.toDateString() === date.toDateString();
    });
  }

  prevMonth(): void {
    if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear--; }
    else this.currentMonth--;
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++; }
    else this.currentMonth++;
    this.buildCalendar();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay = day;
  }

  get currentMonthName(): string {
    return this.monthNames[this.currentMonth] + ' ' + this.currentYear;
  }

  getPriorityClass(p: string): string {
    return p === 'HIGH' ? 'bg-danger' : p === 'MEDIUM' ? 'bg-warning' : 'bg-success';
  }
}
