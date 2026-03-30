import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamLeaderService } from '../../services/manager.service';
import { AuthService } from '../../services/auth.service';
import { Project, Task, User } from '../../models/models';
import { RouterLink } from '@angular/router';

declare var initDashboardCharts: any;

@Component({
  selector: 'app-manager-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class ManagerOverviewComponent implements OnInit, AfterViewInit {
  stats = {
    projects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  };
  today: Date = new Date();
  myProjects: Project[] = [];
  recentTasks: Task[] = [];
  isLoading = true;

  constructor(
    private teamLeaderService: TeamLeaderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Small delay to ensure DOM is fully rendered before chart init
    setTimeout(() => {
      if (typeof initDashboardCharts === 'function') {
        initDashboardCharts();
      }
    }, 500);
  }


  loadDashboardData() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.isLoading = true;
    
    // Load Projects
    this.teamLeaderService.getProjectsByUserId(userId).subscribe(projects => {
      this.myProjects = projects;
      this.stats.projects = projects.length;
      
      let allTasks: Task[] = [];
      let projectsProcessed = 0;

      if (projects.length === 0) {
        this.isLoading = false;
        return;
      }

      projects.forEach(p => {
        this.teamLeaderService.getTasksByProjectId(p.id).subscribe(tasks => {
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
