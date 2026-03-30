import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Task, Reclamation, SubTask } from '../../models/models';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './task-detail.component.html',
  styles: [`
    .task-detail-container { padding: 20px; max-width: 1000px; margin: 0 auto; min-height: 80vh; }
    .card { border-radius: 12px; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.3s ease; }
    .card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .status-badge { font-weight: 600; padding: 6px 14px; border-radius: 20px; font-size: 13px; }
    .subtask-row { transition: all 0.2s; border: 1px solid #f0f0f0 !important; }
    .subtask-row:hover { background-color: #f8f9fa; border-color: #dee2e6 !important; }
    .subtask-row.completed { background-color: #fcfcfc; opacity: 0.8; }
    .subtask-row.completed .subtask-title { text-decoration: line-through; color: #6c757d; }
    .ticket-card { border-left: 4px solid #ffc107; background: #fffdf5; transition: transform 0.2s; }
    .ticket-card:hover { transform: scale(1.02); }
    .ticket-card.resolved { border-left-color: #198754; background: #f6fff9; }
    .back-btn { cursor: pointer; transition: all 0.2s; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
    .back-btn:hover { background-color: #e9ecef; transform: translateX(-3px); }
    .progress-thin { height: 6px; border-radius: 10px; }
  `],
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  taskReclamations: Reclamation[] = [];
  newSubtaskTitle = '';
  ticketMessage = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const taskId = params['id'];
      if (taskId) {
        this.loadTask(Number(taskId));
      }
    });
  }

  loadTask(id: number): void {
    this.loading = true;
    this.employeeService.getTaskById(id).subscribe(
      res => {
        this.task = res;
        this.loadSubtasks(id);
        this.loadReclamations(id);
        this.loading = false;
      },
      err => {
        console.error('Error loading task detail', err);
        this.loading = false;
      }
    );
  }

  loadSubtasks(taskId: number): void {
    this.employeeService.getSubtasks(taskId).subscribe(
      res => { if (this.task) this.task.subtasks = res; },
      err => console.error('Error loading subtasks', err)
    );
  }

  loadReclamations(taskId: number): void {
    this.employeeService.getReclamationsByTask(taskId).subscribe(
      res => this.taskReclamations = res,
      err => console.error('Error loading reclamations', err)
    );
  }

  goBack(): void {
    this.location.back();
  }

  // --- Subtasks ---
  addSubtask(): void {
    if (!this.task || !this.newSubtaskTitle.trim() || !this.task.id) return;
    const sub: SubTask = { title: this.newSubtaskTitle.trim(), done: false };
    this.employeeService.createSubtask(this.task.id, sub).subscribe(
      created => {
        if (!this.task!.subtasks) this.task!.subtasks = [];
        this.task!.subtasks.push(created);
        this.newSubtaskTitle = '';
      },
      err => console.error('Error creating subtask', err)
    );
  }

  toggleSubtask(sub: SubTask): void {
    if (!sub.id) return;
    this.employeeService.toggleSubtask(sub.id).subscribe(
      updated => { sub.done = updated.done; },
      err => { sub.done = !sub.done; }
    );
  }

  removeSubtask(index: number): void {
    const sub = this.task?.subtasks?.[index];
    if (sub?.id) {
      this.employeeService.deleteSubtask(sub.id).subscribe(
        () => this.task?.subtasks?.splice(index, 1),
        err => console.error('Error deleting subtask', err)
      );
    }
  }

  getSubtaskProgress(): number {
    if (!this.task?.subtasks || this.task.subtasks.length === 0) return 0;
    const completed = this.task.subtasks.filter(s => s.done).length;
    return Math.round((completed / this.task.subtasks.length) * 100);
  }

  // --- Task Actions ---
  startTask(): void {
    if (this.task?.id) {
      this.employeeService.startTask(this.task.id).subscribe(
        res => this.task = res
      );
    }
  }

  endTask(): void {
    if (this.task?.id) {
      this.employeeService.endTask(this.task.id).subscribe(
        res => this.task = res
      );
    }
  }

  sendTicket(): void {
    const userId = this.authService.getUserId();
    if (!this.task?.id || !userId || !this.ticketMessage) return;
    
    const rec: Reclamation = { message: this.ticketMessage, status: 'PENDING' };
    this.employeeService.sendBlockingTicket(userId, this.task.id, rec).subscribe(
      () => {
        this.ticketMessage = '';
        this.loadReclamations(this.task!.id!);
        // Close modal manually via data-bs-dismiss
      }
    );
  }

  // --- Helpers ---
  getStatusClass(s: string | undefined): string {
    if (!s) return 'bg-secondary text-white';
    if (s === 'DONE' || s === 'COMPLETED') return 'bg-success text-white';
    if (s === 'IN_PROGRESS') return 'bg-warning text-dark';
    return 'bg-secondary text-white';
  }

  getStatusLabel(s: string | undefined): string {
    if (!s) return 'À faire';
    if (s === 'DONE' || s === 'COMPLETED') return 'Terminée';
    if (s === 'IN_PROGRESS') return 'En cours';
    return 'À faire';
  }

  getPriorityClass(p: string | undefined): string {
    if (p === 'HIGH') return 'bg-danger text-white';
    if (p === 'MEDIUM') return 'bg-warning text-dark';
    return 'bg-success text-white';
  }
}
