import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/models';
import { PersonalPointageComponent } from '../../shared/personal-pointage/personal-pointage.component';

import { ProjectSupportModalComponent } from '../../shared/project-support-modal/project-support-modal.component';
import { NotesPanelComponent } from '../../shared/notes-panel/notes-panel.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, PersonalPointageComponent, ProjectSupportModalComponent, NotesPanelComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];
  selectedProjectForSupport: any = null;
  isLoading = true;
  showSupportModal = false;
  notesProjectId: number | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadProjects();
    }
  }

  loadProjects() {
    this.isLoading = true;
    this.adminService.getAllProjects().subscribe((res: any) => {
      this.projects = res;
      this.isLoading = false;
    });
  }


  viewDetails(project: Project) {
    this.router.navigate(['/commercial/projects', project.id]);
  }

  openProjectSupport(project: any): void {
      this.selectedProjectForSupport = project;
      this.showSupportModal = true;
  }

  closeSupportModal(): void {
      this.showSupportModal = false;
      this.loadProjects();
  }

  openProjectNotes(project: any, event: Event): void {
      event.stopPropagation();
      this.notesProjectId = project.id;
  }

  closeNotes(): void {
      this.notesProjectId = null;
      this.loadProjects();
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
