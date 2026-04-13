import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Team } from '../../models/models';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './team-detail.component.html',
  styleUrl: './team-detail.component.css'
})
export class TeamDetailComponent implements OnInit {
  team: Team | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const teamId = this.route.snapshot.paramMap.get('id');
    if (teamId) {
      this.loadTeamDetails(+teamId);
    }
  }

  loadTeamDetails(id: number) {
    // Re-use getAllTeams and filter or use an endpoint getTeamById if it exists
    this.adminService.getAllTeams().subscribe({
      next: (res: any) => {
        const teams = res.teams || res;
        this.team = teams.find((t: Team) => t.id === id) || null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading team details', err);
        this.isLoading = false;
      }
    });
  }
}
