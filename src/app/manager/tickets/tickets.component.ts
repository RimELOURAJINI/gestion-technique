import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeamLeaderService } from '../../services/manager.service';
import { AuthService } from '../../services/auth.service';
import { Reclamation, Project } from '../../models/models';

@Component({
    selector: 'app-tickets',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './tickets.component.html',
    styleUrl: './tickets.component.css'
})
export class TicketsComponent implements OnInit {
    reclamations: Reclamation[] = [];
    projects: Project[] = [];
    isLoading = true;
    activeTab: 'received' | 'send' = 'received';

    // Send reclamation to admin
    newReclamation: Reclamation = { message: '', title: '' };
    selectedProjectId?: number;

    // Respond to employee reclamation
    selectedReclamation: Reclamation | null = null;
    replyMessage = '';

    constructor(
        private teamLeaderService: TeamLeaderService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        const userId = this.authService.getUserId();
        if (userId) {
            this.teamLeaderService.getProjectsByUserId(userId).subscribe(res => {
                this.projects = res;
                this.loadAllReclamations();
            });
        }
    }

    loadAllReclamations() {
        this.isLoading = true;
        this.reclamations = [];
        if (this.projects.length === 0) { this.isLoading = false; return; }
        let loaded = 0;
        this.projects.forEach(p => {
            if (p.id) {
                this.teamLeaderService.getReclamationsByProjectId(p.id).subscribe(res => {
                    this.reclamations = [...this.reclamations, ...res];
                    loaded++;
                    if (loaded === this.projects.length) this.isLoading = false;
                });
            }
        });
    }

    sendReclamationToAdmin() {
        const userId = this.authService.getUserId();
        if (userId && this.selectedProjectId && this.newReclamation.message) {
            this.teamLeaderService.sendReclamation(userId, +this.selectedProjectId, this.newReclamation).subscribe({
                next: () => {
                    alert('Réclamation envoyée à l\'administrateur.');
                    this.newReclamation = { message: '', title: '' };
                    this.selectedProjectId = undefined;
                },
                error: (err) => console.error(err)
            });
        }
    }

    openReply(r: Reclamation) {
        this.selectedReclamation = r;
        this.replyMessage = '';
    }

    acceptReclamation(id?: number) {
        if (!id) return;
        const response = prompt("Expliquez pourquoi vous acceptez cette réclamation (optionnel) :");
        this.teamLeaderService.updateReclamationStatus(id, 'ACCEPTED', response || '').subscribe({
            next: () => this.loadAllReclamations(),
            error: (err) => console.error(err)
        });
    }

    rejectReclamation(id?: number) {
        if (!id) return;
        const response = prompt("Expliquez pourquoi vous rejetez cette réclamation :");
        if (response === null) return; // Annulé
        this.teamLeaderService.updateReclamationStatus(id, 'REJECTED', response || '').subscribe({
            next: () => this.loadAllReclamations(),
            error: (err) => console.error(err)
        });
    }

    getStatusClass(status?: string): string {
        switch (status?.toUpperCase()) {
            case 'ACCEPTED': return 'bg-success';
            case 'REJECTED': return 'bg-danger';
            case 'REVIEWED': return 'bg-info';
            case 'PENDING': return 'bg-warning';
            default: return 'bg-secondary';
        }
    }

    get pendingReclamations() {
        return this.reclamations.filter(r => (!r.status || r.status.toUpperCase() === 'PENDING') && r.sender?.id !== this.authService.getUserId());
    }

    get resolvedReclamations() {
        return this.reclamations.filter(r => (r.status && r.status.toUpperCase() !== 'PENDING') && r.sender?.id !== this.authService.getUserId());
    }

    get mySentReclamations() {
        return this.reclamations.filter(r => r.sender?.id === this.authService.getUserId());
    }
}
