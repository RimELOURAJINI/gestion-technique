import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManagerService } from '../../services/manager.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/models';

@Component({
    selector: 'app-team-projects',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './team-projects.component.html',
    styleUrl: './team-projects.component.css'
})
export class TeamProjectsComponent implements OnInit {
    projects: Project[] = [];
    isLoading = true;

    constructor(
        private managerService: ManagerService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loadProjects();
    }

    loadProjects() {
        const userId = this.authService.getUserId();
        if (userId) {
            this.managerService.getProjectsByUserId(userId).subscribe({
                next: (res) => {
                    this.projects = res;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error loading projects:', err);
                    this.isLoading = false;
                }
            });
        }
    }

    getStatusClass(status: string): string {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-success';
            case 'started': return 'bg-primary';
            case 'approval': return 'bg-warning';
            default: return 'bg-secondary';
        }
    }
}

