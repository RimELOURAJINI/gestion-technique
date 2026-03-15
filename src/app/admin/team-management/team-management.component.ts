import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Team, User } from '../../models/models';

@Component({
    selector: 'app-team-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
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
        // Load employees and team leaders to assign them to teams
        // Backend is now case-insensitive, but we fetch both to be sure
        this.adminService.getUsersByRole('ROLE_EMPLOYEE').subscribe({
            next: (res1) => {
                this.adminService.getUsersByRole('ROLE_TEAM_LEADER').subscribe({
                    next: (res2) => {
                        this.users = [...(res1 || []), ...(res2 || [])];
                        console.log("Loaded users for team assignment:", this.users.length);
                    },
                    error: (err) => console.error('Error loading team leaders:', err)
                });
            },
            error: (err) => console.error('Error loading employees:', err)
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

    openAssignModal(team: Team) {
        this.selectedTeamForAssign = team;
        this.selectedUserId = null;
    }

    assignUser() {
        if (!this.selectedTeamForAssign || !this.selectedUserId) return;
        this.adminService.assignUserToTeam(this.selectedTeamForAssign.id, +this.selectedUserId).subscribe({
            next: () => {
                this.loadTeams();
                alert("Utilisateur assigné !");
            },
            error: (err) => alert("Erreur: " + err.message)
        });
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
