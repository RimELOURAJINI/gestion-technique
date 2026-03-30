import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { Project, Task } from '../../models/models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-detail.component.html',
  styles: [`
    .project-detail-container { padding: 20px; max-width: 1100px; margin: 0 auto; min-height: 80vh; }
    .project-header { 
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); 
      color: white; 
      border-radius: 16px; 
      padding: 40px; 
      margin-bottom: 30px; 
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.2);
    }
    .task-card { 
      border-radius: 12px; 
      border: 1px solid #edf2f7; 
      transition: all 0.3s ease; 
      cursor: pointer; 
      background: white;
      position: relative;
      overflow: hidden;
    }
    .task-card:hover { 
      transform: translateY(-5px); 
      box-shadow: 0 12px 24px rgba(0,0,0,0.06); 
      border-color: #6366f1; 
    }
    .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-uppercase: uppercase; letter-spacing: 0.5px; }
    .priority-indicator { width: 4px; height: 100%; position: absolute; left: 0; top: 0; }
    .back-btn { background: rgba(255,255,255,0.2); color: white; border: none; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .back-btn:hover { background: rgba(255,255,255,0.3); transform: translateX(-3px); }
    .stat-box { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; flex: 1; min-width: 120px; }
  `],
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  tasks: Task[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const projectId = params['id'];
      if (projectId) {
        this.loadProject(Number(projectId));
      }
    });
  }

  loadProject(id: number): void {
    this.loading = true;
    this.employeeService.getProjectById(id).subscribe(
      res => {
        this.project = res;
        this.loadProjectTasks(id);
      },
      err => {
        console.error('Error loading project', err);
        this.loading = false;
      }
    );
  }

  loadProjectTasks(projectId: number): void {
    this.employeeService.getTasksByProject(projectId).subscribe(
      res => {
        this.tasks = res;
        this.loading = false;
      },
      err => {
        console.error('Error loading project tasks', err);
        this.loading = false;
      }
    );
  }

  goBack(): void {
    this.location.back();
  }

  // --- Helpers ---
  getStatusClass(s: string | undefined): string {
    if (s === 'DONE' || s === 'COMPLETED') return 'bg-success text-white';
    if (s === 'IN_PROGRESS') return 'bg-warning text-dark';
    return 'bg-secondary text-white';
  }

  getPriorityColor(p: string | undefined): string {
    if (p === 'HIGH') return '#ef4444';
    if (p === 'MEDIUM') return '#f59e0b';
    return '#10b981';
  }

  getTasksByStatus(status: string): number {
    return this.tasks.filter(t => t.status === status).length;
  }
}
