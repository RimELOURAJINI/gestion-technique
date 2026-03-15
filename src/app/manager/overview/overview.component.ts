import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerService } from '../../services/manager.service';
import { AuthService } from '../../services/auth.service';
import { Project, Task, User } from '../../models/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-manager-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class ManagerOverviewComponent implements OnInit {
  stats = {
    projects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  };
  myProjects: Project[] = [];
  recentTasks: Task[] = [];
  isLoading = true;

  constructor(
    private managerService: ManagerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.isLoading = true;
    
    // Load Projects
    this.managerService.getProjectsByUserId(userId).subscribe(projects => {
      this.myProjects = projects;
      this.stats.projects = projects.length;
      
      let allTasks: Task[] = [];
      let projectsProcessed = 0;

      if (projects.length === 0) {
        this.isLoading = false;
        return;
      }

      projects.forEach(p => {
        this.managerService.getTasksByProjectId(p.id).subscribe(tasks => {
          allTasks = [...allTasks, ...tasks];
          projectsProcessed++;

          if (projectsProcessed === projects.length) {
            this.stats.activeTasks = allTasks.filter(t => t.status !== 'DONE' && t.status !== 'COMPLETED').length;
            this.stats.completedTasks = allTasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
            this.recentTasks = allTasks.slice(-5).reverse();
            
            // Unique team members across projects
            const memberIds = new Set();
            projects.forEach(proj => {
              proj.team?.users?.forEach(u => memberIds.add(u.id));
            });
            this.stats.teamMembers = memberIds.size;
            
            this.isLoading = false;
          }
        });
      });
    });
  }
}
