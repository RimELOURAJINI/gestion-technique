import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskDetailService } from '../../services/task-detail.service';
import { EmployeeService } from '../../services/employee.service';
import { Task, TaskNote, TaskStatusHistory, User } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent implements OnInit {
  @Input() taskId!: number;
  @Input() mode: 'manager' | 'employee' | 'commercial' | 'admin' = 'employee';
  @Output() close = new EventEmitter<void>();

  task: Task | null = null;
  notes: TaskNote[] = [];
  history: TaskStatusHistory[] = [];
  isLoading = true;
  
  newNoteContent: string = '';
  currentUser: User | null = null;

  constructor(
    private taskDetailService: TaskDetailService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue as any;
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;
    this.taskDetailService.getTaskById(this.taskId).subscribe({
      next: (t) => {
        this.task = t;
        this.loadNotes();
        this.loadHistory();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadNotes(): void {
    this.taskDetailService.getTaskNotes(this.taskId).subscribe(n => {
      this.notes = n;
      // Mark as read if there are unread notes
      if (this.currentUser && n.some(note => !(note as any).isRead)) {
        this.employeeService.markNotesAsRead(this.taskId, this.currentUser.id).subscribe();
      }
    });
  }

  loadHistory(): void {
    this.taskDetailService.getTaskHistory(this.taskId).subscribe(h => this.history = h);
  }

  addNote(): void {
    if (!this.newNoteContent.trim() || !this.currentUser) return;
    
    this.taskDetailService.addNote(this.taskId, this.currentUser.id, this.newNoteContent).subscribe({
      next: (note) => {
        this.notes.unshift(note);
        this.newNoteContent = '';
      }
    });
  }

  openTicketHub(): void {
    // Navigate to ticket hub with taskId
    const basePath = this.mode === 'manager' ? '/manager' : 
                     this.mode === 'commercial' ? '/commercial' :
                     this.mode === 'admin' ? '/admin' : '/employee';
    
    this.router.navigate([`${basePath}/tickets`], { queryParams: { taskId: this.taskId } });
  }

  getStatusDuration(status: string): string {
    const records = this.history.filter(h => h.status === status);
    let totalMinutes = 0;
    records.forEach(r => {
      if (r.durationMinutes) {
        totalMinutes += r.durationMinutes;
      } else if (!r.exitDate) {
        // Still in this status
        const now = new Date().getTime();
        const entry = new Date(r.entryDate).getTime();
        totalMinutes += Math.floor((now - entry) / 60000);
      }
    });

    if (totalMinutes === 0) return '0 min';
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  }

  getAvailableStatuses(): string[] {
    return ['TODO', 'IN_PROGRESS', 'TEST', 'DONE'];
  }

  onClose(): void {
    this.close.emit();
  }
}
