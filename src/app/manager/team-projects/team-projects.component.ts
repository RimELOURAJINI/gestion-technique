import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeamLeaderService } from '../../services/manager.service';
import { AuthService } from '../../services/auth.service';
import { Project, Ticket } from '../../models/models';
import { TicketService } from '../../services/ticket.service';
import { ProjectSupportModalComponent } from '../../shared/project-support-modal/project-support-modal.component';

@Component({
    selector: 'app-team-projects',
    standalone: true,
    imports: [CommonModule, RouterModule, ProjectSupportModalComponent],
    templateUrl: './team-projects.component.html',
    styleUrl: './team-projects.component.css'
})
export class TeamProjectsComponent implements OnInit {
    projects: Project[] = [];
    isLoading = true;
    showSupportModal = false;
    selectedSupportProject: Project | null = null;

    constructor(
        private teamLeaderService: TeamLeaderService,
        private authService: AuthService,
        private ticketService: TicketService
    ) { }

    ngOnInit() {
        this.loadProjects();
    }

    loadProjects() {
        const userId = this.authService.getUserId();
        if (userId) {
            this.teamLeaderService.getProjectsByUserId(userId).subscribe({
                next: (res) => {
                    // Only show ongoing projects (exclude COMPLETED, TERMINE, etc.)
                    this.projects = res.filter(p => {
                        const s = (p.status || '').toUpperCase();
                        return s !== 'COMPLETED' && s !== 'DONE' && s !== 'TERMINE' && s !== 'TERMINEE' && s !== 'DELIVERED';
                    });
                    this.loadTicketCounts(userId);
                },
                error: (err) => {
                    console.error('Error loading projects:', err);
                    this.isLoading = false;
                }
            });
        }
    }

    loadTicketCounts(userId: number) {
        this.ticketService.getTicketsByManager(userId).subscribe({
            next: (tickets: Ticket[]) => {
                const openTickets = tickets.filter(t => t.status !== 'VALIDATED' && t.status !== 'fermé' && t.status !== 'CLOSED');
                this.projects.forEach(p => {
                    p.openTicketsCount = openTickets.filter(t => t.project?.id === p.id && !t.task).length;
                });
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    openSupportModal(project: Project, event: Event) {
        event.stopPropagation();
        this.selectedSupportProject = project;
        this.showSupportModal = true;
    }

    closeSupportModal() {
        this.showSupportModal = false;
        this.selectedSupportProject = null;
    }

    getProgress(project: Project): number {
        return project.progress || 0;
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


