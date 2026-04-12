import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];
  projectIdsWithTickets: number[] = [];
  isLoading = true;

  constructor(
    private adminService: AdminService,
    private authService: AuthService
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
    this.adminService.getProjectIdsWithTickets().subscribe({
        next: (ids) => this.projectIdsWithTickets = ids
    });
  }

  hasTickets(projectId: number): boolean {
      return this.projectIdsWithTickets.includes(projectId);
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
