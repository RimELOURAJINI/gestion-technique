import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/models';

import { RouterModule, Router } from '@angular/router';

import { ProjectSupportModalComponent } from '../../shared/project-support-modal/project-support-modal.component';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, ProjectSupportModalComponent],
  templateUrl: './my-projects.component.html',
  styleUrl: './my-projects.component.css'
})
export class MyProjectsComponent implements OnInit {
  projects: Project[] = [];
  ongoingProjects: Project[] = [];
  historicalProjects: Project[] = [];
  activeTab: 'ongoing' | 'history' = 'ongoing';
  showSupportModal = false;
  selectedProjectForSupport: any = null;

  showHistoryModal = false;
  selectedProjectForHistory: Project | null = null;
  historyTasks: any[] = [];
  isLoadingHistory = false;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      // Combine projects from tasks and projects from official API
      this.employeeService.getMyTasks(userId).subscribe(tasks => {
        const projectMap = new Map<number, Project>();
        tasks.forEach(t => {
          if (t.project && t.project.id) {
            projectMap.set(t.project.id, t.project);
          }
        });

        this.employeeService.getMyProjects(userId).subscribe(enrichedRes => {
          const finalProjects: Project[] = [];
          
          // Use projects from tasks as base
          const unfinishedProjectIds = new Set<number>();
          tasks.forEach(t => {
            const isDone = t.status === 'DONE' || t.status === 'COMPLETED' || t.status === 'TERMINE';
            if (t.project && t.project.id && !isDone) {
              unfinishedProjectIds.add(t.project.id);
            }
          });

          projectMap.forEach((p, id) => {
            const enriched = enrichedRes.find(ep => ep.id === id);
            finalProjects.push(enriched || p);
          });

          // Add other projects from official API
          enrichedRes.forEach(ep => {
            if (!projectMap.has(ep.id!)) {
              finalProjects.push(ep);
            }
          });

          this.projects = finalProjects;
          
          // Logic: Project is ongoing if it's NOT COMPLETED OR the user has unfinished tasks in it
          this.ongoingProjects = finalProjects.filter(p => p.status !== 'COMPLETED' || unfinishedProjectIds.has(p.id!));
          
          // Project is in history if it's COMPLETED AND the user has no more unfinished tasks in it
          this.historicalProjects = finalProjects.filter(p => p.status === 'COMPLETED' && !unfinishedProjectIds.has(p.id!));
        });
      });
    }
  }

  setTab(tab: 'ongoing' | 'history'): void {
    this.activeTab = tab;
  }

  openProjectDetail(project: Project): void {
    if (project.id) {
      this.router.navigate(['/employee/projects', project.id]);
    }
  }

  openProjectSupport(project: Project): void {
    this.selectedProjectForSupport = project;
    this.showSupportModal = true;
  }

  openHistoryDetail(project: Project): void {
    this.selectedProjectForHistory = project;
    this.showHistoryModal = true;
    this.isLoadingHistory = true;
    this.historyTasks = [];
    
    if (project.id) {
      this.employeeService.getTasksByProject(project.id).subscribe({
        next: (tasks) => {
          this.historyTasks = tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED');
          this.isLoadingHistory = false;
        },
        error: () => this.isLoadingHistory = false
      });
    }
  }

  calculateDuration(start: any, end: any): string {
    if (!start || !end) return 'N/A';
    const s = new Date(start);
    const e = new Date(end);
    const diffMs = e.getTime() - s.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  }


}
