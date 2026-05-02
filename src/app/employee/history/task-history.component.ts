import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/models';

@Component({
  selector: 'app-task-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content container-fluid">
        <div class="page-header">
            <div class="row align-items-center">
                <div class="col">
                    <h3 class="page-title">Historique des Tâches</h3>
                    <ul class="breadcrumb">
                        <li class="breadcrumb-item"><a routerLink="/employee/home">Dashboard</a></li>
                        <li class="breadcrumb-item active">Historique</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div *ngIf="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                </div>

                <div *ngIf="!loading && days.length === 0" class="text-center py-5">
                    <i class="ti ti-history fs-40 text-muted mb-3"></i>
                    <h5 class="text-muted">Aucun historique disponible</h5>
                    <p class="text-muted small">Les tâches terminées apparaîtront ici par jour.</p>
                </div>

                <div *ngFor="let day of days" class="mb-4">
                    <div class="d-flex align-items-center mb-3">
                        <div class="badge bg-soft-primary text-primary px-3 py-2 rounded-pill fs-13 fw-bold">
                            <i class="ti ti-calendar-event me-1"></i> {{ day | date:'fullDate' }}
                        </div>
                        <div class="flex-grow-1 ms-2 border-top"></div>
                    </div>

                    <div class="card border-0 shadow-sm overflow-hidden mb-3">
                        <div class="list-group list-group-flush">
                            <div *ngFor="let task of groupedTasks[day]" class="list-group-item p-3 border-start border-4" [class.border-success]="task.project" [class.border-info]="!task.project">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1 fw-bold text-dark">{{ task.title }}</h6>
                                        <div class="d-flex gap-3 align-items-center">
                                            <span *ngIf="task.project" class="fs-12 text-muted">
                                                <i class="ti ti-briefcase me-1"></i> {{ task.project.name }}
                                            </span>
                                            <span *ngIf="!task.project" class="fs-12 text-muted">
                                                <i class="ti ti-user-check me-1"></i> Tâche personnelle
                                            </span>
                                            <span class="fs-12 text-muted" *ngIf="task.actualEndTime">
                                                <i class="ti ti-check-double me-1 text-success"></i> Fini à {{ task.actualEndTime | date:'HH:mm' }}
                                            </span>
                                        </div>
                                    </div>
                                    <span class="badge" [ngClass]="task.priority === 'HIGH' ? 'bg-danger' : (task.priority === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-success')">
                                        {{ task.priority }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .list-group-item { transition: background 0.2s; }
    .list-group-item:hover { background: #f8f9fa; }
  `]
})
export class TaskHistoryComponent implements OnInit {
  groupedTasks: { [day: string]: Task[] } = {};
  days: string[] = [];
  loading = true;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.employeeService.getMyTasks(userId).subscribe({
        next: (tasks) => {
          const completed = tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED');
          
          this.groupedTasks = {};
          completed.forEach(task => {
            const date = task.actualEndTime ? new Date(task.actualEndTime).toDateString() : (task.createdAt ? new Date(task.createdAt).toDateString() : 'Unknown');
            if (!this.groupedTasks[date]) {
              this.groupedTasks[date] = [];
            }
            this.groupedTasks[date].push(task);
          });

          this.days = Object.keys(this.groupedTasks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading history', err);
          this.loading = false;
        }
      });
    }
  }
}
