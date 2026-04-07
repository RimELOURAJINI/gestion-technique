import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { Project } from '../../models/models';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  clientName = '';

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.clientName = localStorage.getItem('userName') || 'Client';
    this.loadClientProjects();
  }

  loadClientProjects() {
    this.isLoading = true;
    // Note: Since Project entity doesn't have a direct 'client' relation yet, 
    // we fetch all projects and display a subset as a placeholder for the client.
    this.adminService.getAllProjects().subscribe({
      next: (res: Project[]) => {
        // Ideally: res.filter(p => p.clientId === this.authService.getUserId())
        this.projects = res;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading client projects:', err);
        this.isLoading = false;
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  getTranslateStatus(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'IN_PROGRESS': return 'En Cours';
      case 'ON_HOLD': return 'En Pause';
      case 'COMPLETED': return 'Terminé';
      case 'NOT_STARTED': return 'Non Démarré';
      default: return status || 'N/A';
    }
  }

  getStatusClass(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'IN_PROGRESS': return 'bg-primary';
      case 'ON_HOLD': return 'bg-warning';
      case 'COMPLETED': return 'bg-success';
      case 'NOT_STARTED': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getProgress(project: Project): number {
    if (!project.budget || project.budget === 0) return 0;
    const spent = project.spentBudget || 0;
    const progress = (spent / project.budget) * 100;
    return Math.min(Math.round(progress), 100);
  }
}
