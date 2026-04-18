import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeamLeaderService } from '../../services/manager.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { Team, User } from '../../models/models';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-team.component.html',
  styleUrl: './my-team.component.css'
})
export class MyTeamComponent implements OnInit {
  team: Team | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private teamLeaderService: TeamLeaderService,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.isLoading = false;
      this.errorMessage = "Utilisateur non connecté.";
      return;
    }

    if (this.authService.isCommercialLeader()) {
      this.loadAllCommercials();
    } else {
      this.loadMyTeam(userId);
    }
  }

  loadMyTeam(managerId: number) {
    this.teamLeaderService.getMyTeam(managerId).subscribe({
      next: (res) => {
        this.team = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading my team', err);
        this.isLoading = false;
        if (err.status === 404) {
             this.errorMessage = "Vous n'êtes responsable d'aucune équipe.";
        } else {
             this.errorMessage = "Erreur lors du chargement de votre équipe.";
        }
      }
    });
  }

  loadAllCommercials() {
    console.log('📊 Commercial Leader detected: Loading all commercial users...');
    this.adminService.getUsersByRole('COMMERCIAL').subscribe({
      next: (users: User[]) => {
        // Create a virtual team object to reuse the template
        this.team = {
          id: 0,
          name: 'Force de Vente Commerciale',
          description: 'Tous les collaborateurs du département commercial.',
          users: users
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading commercial users', err);
        this.isLoading = false;
        this.errorMessage = "Erreur lors du chargement des commerciaux.";
      }
    });
  }
}
