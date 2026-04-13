import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Team, User } from '../../models/models';

@Component({
    selector: 'app-team-management',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './team-management.component.html',
    styleUrl: './team-management.component.css'
})
export class TeamManagementComponent implements OnInit {
    teams: Team[] = [];
    users: User[] = [];
    
    newTeam: any = { name: '', description: '' };
    editingTeam: Team | null = null;
    
    selectedTeamForAssign: Team | null = null;
    selectedUserId: number | null = null;
    assignMode: 'user' | 'manager' = 'user';

    constructor(private adminService: AdminService) { }

    ngOnInit() { 
        this.loadTeams(); 
        this.loadUsers();
    }

    loadTeams() {
        this.adminService.getAllTeams().subscribe({
            next: (res: any) => this.teams = res.teams || res,
            error: (err) => console.error('Error loading teams:', err)
        });
    }

    loadUsers() {
        // Load all users and filter out admins for team assignment
        this.adminService.getAllUsers().subscribe({
            next: (res: any) => {
                const allUsers = res.users || res;
                if (Array.isArray(allUsers)) {
                    this.users = allUsers.filter(user => 
                        !user.roles?.some((role: any) => role.name === 'ROLE_ADMIN')
                    );
                    console.log("Users loaded for team assignment (excluding admins):", this.users.length);
                }
            },
            error: (err) => console.error('Error loading users for team assignment:', err)
        });
    }

    createTeam() {
        if (!this.newTeam.name) return;
        this.adminService.createTeam(this.newTeam).subscribe({
            next: () => {
                this.loadTeams();
                this.newTeam = { name: '', description: '' };
                alert("Équipe créée avec succès");
            },
            error: (err) => alert("Erreur: " + (err.error?.message || err.message))
        });
    }

    openEditTeam(team: Team) {
        this.editingTeam = team;
        this.newTeam = { name: team.name, description: team.description };
    }

    updateTeam() {
        if (!this.editingTeam) return;
        this.adminService.updateTeam(this.editingTeam.id, this.newTeam).subscribe({
            next: () => {
                this.loadTeams();
                this.resetForm();
                alert("Équipe mise à jour.");
            },
            error: (err) => alert("Erreur: " + (err.error?.message || err.message))
        });
    }

    openAssignModal(team: Team, mode: 'user' | 'manager' = 'user') {
        this.selectedTeamForAssign = team;
        this.selectedUserId = null;
        this.assignMode = mode;
    }

    assignUser() {
        if (!this.selectedTeamForAssign) return;
        if (!this.selectedUserId) {
            alert("Veuillez sélectionner un utilisateur d'abord.");
            return;
        }
        if (this.assignMode === 'user') {
            this.adminService.assignUserToTeam(this.selectedTeamForAssign.id, +this.selectedUserId).subscribe({
                next: () => {
                    this.loadTeams();
                    alert("Utilisateur assigné avec succès !");
                },
                error: (err) => {
                    console.error("Assign error details:", err);
                    const msg = err.error?.message || err.error || err.message;
                    alert("Erreur lors de l'assignation: " + msg);
                }
            });
        } else {
            this.adminService.assignManagerToTeam(this.selectedTeamForAssign.id, +this.selectedUserId).subscribe({
                next: () => {
                    this.loadTeams();
                    alert("Responsable assigné avec succès !");
                },
                error: (err) => {
                    console.error("Assign error details:", err);
                    const msg = err.error?.message || err.error || err.message;
                    alert("Erreur lors de l'assignation: " + msg);
                }
            });
        }
    }

    removeUser(teamId: number, userId: number) {
        if (!confirm("Voulez-vous retirer cet utilisateur de l'équipe ?")) return;
        this.adminService.removeUserFromTeam(teamId, userId).subscribe({
            next: () => this.loadTeams(),
            error: (err) => alert("Erreur: " + err.message)
        });
    }

    resetForm() {
        this.editingTeam = null;
        this.newTeam = { name: '', description: '' };
    }
}
