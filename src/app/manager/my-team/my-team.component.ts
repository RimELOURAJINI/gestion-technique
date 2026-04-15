import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeamLeaderService } from '../../services/manager.service';
import { AuthService } from '../../services/auth.service';
import { Team } from '../../models/models';

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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadMyTeam(userId);
    } else {
      this.isLoading = false;
      this.errorMessage = "Utilisateur non connecté.";
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
}
