import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/models';

@Component({
  selector: 'app-employee-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css'
})
export class EmployeePerformanceComponent implements OnInit {
  tasks: Task[] = [];
  total = 0;
  done = 0;
  inProgress = 0;
  todo = 0;
  completionRate = 0;
  onTimeCount = 0;

  constructor(private employeeService: EmployeeService, private authService: AuthService) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.employeeService.getMyTasks(userId).subscribe(tasks => {
        this.tasks = tasks;
        this.computeStats();
      });
    }
  }

  computeStats(): void {
    this.total = this.tasks.length;
    this.done = this.tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
    this.inProgress = this.tasks.filter(t => t.status === 'IN_PROGRESS').length;
    this.todo = this.tasks.filter(t => t.status === 'TODO' || t.status === 'TO_DO').length;
    this.completionRate = this.total > 0 ? Math.round((this.done / this.total) * 100) : 0;
    this.onTimeCount = this.tasks.filter(t => {
      if (!t.deadline || !t.actualEndTime) return false;
      return new Date(t.actualEndTime) <= new Date(t.deadline);
    }).length;
  }

  getPriorityClass(p: string) {
    if (p === 'HIGH') return 'bg-danger';
    if (p === 'MEDIUM') return 'bg-warning';
    return 'bg-success';
  }

  getStatusLabel(s: string) {
    if (s === 'DONE' || s === 'COMPLETED') return 'Terminée';
    if (s === 'IN_PROGRESS') return 'En cours';
    return 'À faire';
  }
}
