import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Project, Team, User, Reclamation } from '../../models/models';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AiService } from '../../services/ai.service';
import { FormsModule } from '@angular/forms';
import { PersonalPointageComponent } from '../../shared/personal-pointage/personal-pointage.component';
import { ProjectSupportModalComponent } from '../../shared/project-support-modal/project-support-modal.component';

declare var initDashboardCharts: any;

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, PersonalPointageComponent, ProjectSupportModalComponent, RouterModule, FormsModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class AdminOverviewComponent implements OnInit, AfterViewInit {
  stats = {
    projects: 0,
    teams: 0,
    managers: 0,
    reclamations: 0
  };
  projectBreakdown = {
    completedText: '0%',
    delayedText: '0%',
    inProgressText: '0%'
  };
  recentProjects: Project[] = [];
  recentReclamations: Reclamation[] = [];
  isLoading = true;
  today: Date = new Date();

  isAiLoading = false;
  aiMessage = '';
  
  // Nouveaux paramètres pour aide à la décision
  riskThreshold: number = 80;
  totalReclamations = 0;
  resolvedReclamations = 0;

  // Added missing properties for the template
  projects: Project[] = [];
  showSupportModal = false;
  selectedProject: any = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private aiService: AiService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  ngAfterViewInit() {
    // Small delay to ensure DOM is fully rendered before chart init
    setTimeout(() => {
      if (typeof initDashboardCharts === 'function') {
        initDashboardCharts();
      }
    }, 500);
  }


  loadStats() {
    this.isLoading = true;
    
    // Load Projects
    this.adminService.getAllProjects().subscribe((projects) => {
      this.projects = projects; // Set the projects array
      this.stats.projects = projects.length;
      this.recentProjects = projects.slice(-5).reverse();
      
      if (projects.length > 0) {
          const completed = projects.filter(p => p.status === 'COMPLETED').length;
          const delayed = projects.filter(p => {
              if (p.status === 'COMPLETED') return false;
              if (p.deadline) return new Date(p.deadline) < this.today;
              if (p.expectedEndDate) return new Date(p.expectedEndDate) < this.today;
              return false;
          }).length;
          const inProgress = projects.length - completed - delayed;
          
          this.projectBreakdown.completedText = Math.round((completed / projects.length) * 100) + '%';
          this.projectBreakdown.delayedText = Math.round((delayed / projects.length) * 100) + '%';
          this.projectBreakdown.inProgressText = Math.round((inProgress / projects.length) * 100) + '%';
      }
    });

    // Load Teams
    this.adminService.getAllTeams().subscribe((teams: any) => {
      const teamList = teams.teams || teams;
      this.stats.teams = teamList.length;
    });

    // Load Managers
    this.adminService.getUsersByRole('ROLE_TEAM_LEADER').subscribe((managers) => {
      this.stats.managers = managers.length;
    });

    // Load Reclamations
    this.adminService.getReclamations().subscribe((reclamations) => {
      this.totalReclamations = reclamations.length;
      this.resolvedReclamations = reclamations.filter(r => r.status && r.status !== 'PENDING').length;
      
      this.stats.reclamations = reclamations.filter(r => r.status === 'PENDING').length;
      this.recentReclamations = reclamations.slice(-5).reverse();
      this.isLoading = false;
    });
  }

  refreshAiStats() {
    // ... existing refreshAiStats code ...
  }

  // Added missing method
  openProjectTickets(project: any) {
    this.selectedProject = project;
    this.showSupportModal = true;
  }
}
