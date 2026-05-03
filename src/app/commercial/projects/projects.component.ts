import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/models';
import { PersonalPointageComponent } from '../../shared/personal-pointage/personal-pointage.component';

import { ProjectSupportModalComponent } from '../../shared/project-support-modal/project-support-modal.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, PersonalPointageComponent, ProjectSupportModalComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];
  selectedProjectForSupport: any = null;
  unreadTicketCounts: any = {};
  isLoading = true;
  showSupportModal = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadProjects(userId);
      this.loadTicketIndicators();
    }
  }

  loadProjects(userId: number) {
    this.adminService.getAllProjects().subscribe((res: any) => {
      this.projects = res;
      this.isLoading = false;
    });
  }

  loadTicketIndicators() {
    this.adminService.getProjectUnreadTicketCounts().subscribe({
        next: (counts) => this.unreadTicketCounts = counts
    });
  }

  viewDetails(project: Project) {
    this.router.navigate(['/commercial/projects', project.id]);
  }

  isProjectTicketActive(projectId: number): boolean {
      return (this.unreadTicketCounts[projectId] || 0) > 0;
  }

  hasTickets(projectId: number): boolean {
      return (this.unreadTicketCounts[projectId] || 0) > 0;
  }

  openProjectSupport(project: any): void {
      this.selectedProjectForSupport = project;
      this.showSupportModal = true;
  }

  getStatusClass(status?: string): string {
    switch(status?.toLowerCase()) {
      case 'in progress': return 'bg-primary';
      case 'completed': return 'bg-success';
      case 'on hold': return 'bg-warning';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getTranslateStatus(status?: string): string {
    switch(status?.toLowerCase()) {
      case 'in progress': return 'En Cours';
      case 'completed': return 'Terminé';
      case 'on hold': return 'En Pause';
      case 'cancelled': return 'Annulé';
      default: return status || 'N/A';
    }
  }
}
