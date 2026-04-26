import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/models';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
  note?: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  dayNote: string = '';
  notesMap: { [key: string]: string } = {};
  currentUserId: number | null = null;

  monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  dayNames = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  constructor(private employeeService: EmployeeService, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    if (this.currentUserId) {
      // Load both tasks and notes from backend
      this.employeeService.getMyTasks(this.currentUserId).subscribe(tasks => {
        this.tasks = tasks;
        this.loadNotes();
      });
    } else {
      this.buildCalendar();
    }
  }

  loadNotes(): void {
    if (!this.currentUserId) return;
    this.employeeService.getCalendarNotes(this.currentUserId).subscribe(notes => {
      this.notesMap = {};
      notes.forEach(n => {
        this.notesMap[n.date] = n.content;
      });
      this.buildCalendar();
    });
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
      const key = this.formatDate(d);
      days.push({ date: d, isCurrentMonth: false, isToday: false, tasks: this.getTasksForDate(d), note: this.notesMap[key] });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(this.currentYear, this.currentMonth, i);
      const isToday = d.toDateString() === this.today.toDateString();
      const key = d.toDateString();
      days.push({ date: d, isCurrentMonth: true, isToday, tasks: this.getTasksForDate(d), note: this.notesMap[key] });
    }
    // Fill to 6 rows
    let remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(lastDay);
      d.setDate(d.getDate() + i);
      const key = this.formatDate(d);
      days.push({ date: d, isCurrentMonth: false, isToday: false, tasks: this.getTasksForDate(d), note: this.notesMap[key] });
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
    const key = day.date.toDateString();
    this.dayNote = this.notesMap[key] || '';
  }

  saveNote(): void {
    if (!this.selectedDay || !this.currentUserId) return;
    const key = this.formatDate(this.selectedDay.date);
    
    const noteObj = {
      userId: this.currentUserId,
      date: key,
      content: this.dayNote.trim()
    };

    this.employeeService.saveCalendarNote(noteObj).subscribe({
      next: (saved) => {
        if (this.dayNote.trim()) {
          this.notesMap[key] = this.dayNote.trim();
        } else {
          delete this.notesMap[key];
        }
        this.buildCalendar();
      },
      error: (err) => alert('Erreur lors de la sauvegarde de la note.')
    });
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }

  get currentMonthName(): string {
    return this.monthNames[this.currentMonth] + ' ' + this.currentYear;
  }

  getPriorityClass(p: string): string {
    return p === 'HIGH' ? 'bg-danger' : p === 'MEDIUM' ? 'bg-warning' : 'bg-success';
  }
}
