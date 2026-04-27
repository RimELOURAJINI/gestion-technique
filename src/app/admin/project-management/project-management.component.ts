import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Project, Team, User } from '../../models/models';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { ProjectSupportModalComponent } from '../../shared/project-support-modal/project-support-modal.component';

@Component({
    selector: 'app-project-management',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ProjectSupportModalComponent],
    templateUrl: './project-management.component.html',
    styleUrl: './project-management.component.css'
})
export class ProjectManagementComponent implements OnInit {
    projects: Project[] = [];
    teams: Team[] = [];
    managers: User[] = [];
    isLoading = true;

    // New / Edit project form
    editingProject: any = null;
    newProject: any = { name: '', description: '', status: 'ACTIVE', expectedEndDate: '', startDate: '', budget: null };
    selectedTeamId: number | null = null;

    // Assignment
    selectedProjectId: number | null = null;
    selectedManagerId: number | null = null;

    // Support Modal
    showSupportModal = false;
    selectedSupportProject: Project | null = null;

    constructor(private adminService: AdminService, private ticketService: TicketService, private authService: AuthService) { }

    ngOnInit() {
        this.loadAll();
    }

    loadAll() {
        this.isLoading = true;
        this.adminService.getAllProjects().subscribe({
            next: (res) => { this.projects = res; this.isLoading = false; },
            error: () => this.isLoading = false
        });
        this.adminService.getAllTeams().subscribe({
            next: (res: any) => this.teams = res.teams || res,
            error: (err) => console.error(err)
        });
        // Load managers using ROLE_TEAM_LEADER (actual role name in DB)
        this.adminService.getUsersByRole('ROLE_TEAM_LEADER').subscribe({
            next: (res) => this.managers = res,
            error: (err) => console.error(err)
        });
    }

    saveProject() {
        if (!this.newProject.name) {
            alert("Le nom du projet est obligatoire.");
            return;
        }

        const projectPayload = { ...this.newProject };
        // Ensure dates are null if empty string to avoid backend parsing errors
        if (!projectPayload.expectedEndDate || projectPayload.expectedEndDate === '') {
            projectPayload.expectedEndDate = null;
        }
        if (!projectPayload.startDate || projectPayload.startDate === '') {
            projectPayload.startDate = null;
        }

        console.log("Saving project payload:", projectPayload);

        if (this.editingProject) {
            this.adminService.updateProject(this.editingProject.id, projectPayload).subscribe({
                next: () => { 
                    this.loadAll(); 
                    this.resetForm(); 
                    alert("Projet mis à jour avec succès.");
                },
                error: (err) => {
                    console.error(err);
                    alert("Erreur lors de la mise à jour : " + (err.error?.message || err.message));
                }
            });
        } else {
            this.adminService.createProject(projectPayload).subscribe({
                next: (res) => { 
                    this.loadAll(); 
                    this.resetForm(); 
                    alert("Projet créé avec succès.");
                },
                error: (err) => {
                    console.error(err);
                    alert("Erreur lors de la création : " + (err.error?.message || err.message));
                }
            });
        }
    }

    editProject(project: Project) {
        this.editingProject = project;
        this.newProject = {
            name: project.name,
            description: project.description,
            status: project.status,
            expectedEndDate: project.expectedEndDate ? new Date(project.expectedEndDate).toISOString().substring(0, 10) : '',
            startDate: project.startDate ? new Date(project.startDate).toISOString().substring(0, 10) : '',
            budget: project.budget || null
        };
    }

    deleteProject(id: number) {
        if (!confirm('Supprimer ce projet ?')) return;
        this.adminService.deleteProject(id).subscribe({
            next: () => this.loadAll(),
            error: (err) => console.error(err)
        });
    }

    assignManager() {
        if (!this.selectedProjectId || !this.selectedManagerId) return;
        this.adminService.assignProjectToManager(+this.selectedProjectId, +this.selectedManagerId).subscribe({
            next: () => { this.loadAll(); this.selectedProjectId = null; this.selectedManagerId = null; },
            error: (err) => console.error(err)
        });
    }

    openAssignModal(projectId: number) {
        this.selectedProjectId = projectId;
    }

    openSupportModal(project: Project, event?: Event) {
        if (event) event.stopPropagation();
        this.selectedSupportProject = project;
        this.showSupportModal = true;
    }

    closeSupportModal() {
        this.showSupportModal = false;
        this.selectedSupportProject = null;
    }

    getProgress(project: Project): number {
        if (!project.budget || !project.spentBudget) return 0;
        return Math.min(Math.round((project.spentBudget / project.budget) * 100), 100);
    }

    getStatusClass(status: string): string {
        switch (status?.toUpperCase()) {
            case 'ACTIVE': return 'bg-soft-success text-success';
            case 'COMPLETED': return 'bg-success text-white';
            case 'ON_HOLD': return 'bg-soft-warning text-warning';
            case 'CANCELLED': return 'bg-soft-danger text-danger';
            default: return 'bg-soft-secondary text-secondary';
        }
    }

    resetForm() {
        this.editingProject = null;
        this.newProject = { name: '', description: '', status: 'ACTIVE', expectedEndDate: '', startDate: '', budget: null };
        this.selectedTeamId = null;
    }

    getStatusBadge(status: string): string {
        switch (status) {
            case 'ACTIVE': return 'bg-info';
            case 'COMPLETED': return 'bg-success';
            case 'ON_HOLD': return 'bg-warning';
            case 'CANCELLED': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }
}
