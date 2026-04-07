import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Project } from '../../models/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getAllProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
        this.isLoading = false;
      }
    });
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
