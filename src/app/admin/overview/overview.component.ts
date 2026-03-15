import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Project, Team, User, Reclamation } from '../../models/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class AdminOverviewComponent implements OnInit {
  stats = {
    projects: 0,
    teams: 0,
    managers: 0,
    reclamations: 0
  };
  recentProjects: Project[] = [];
  recentReclamations: Reclamation[] = [];
  isLoading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    
    // Load Projects
    this.adminService.getAllProjects().subscribe((projects) => {
      this.stats.projects = projects.length;
      this.recentProjects = projects.slice(-5).reverse();
    });

    // Load Teams
    this.adminService.getAllTeams().subscribe((teams: any) => {
      const teamList = teams.teams || teams;
      this.stats.teams = teamList.length;
    });

    // Load Managers
    this.adminService.getUsersByRole('ROLE_TEAM_LEADER').subscribe((managers) => {
      this.stats.managers = managers.length;
    });

    // Load Reclamations
    this.adminService.getReclamations().subscribe((reclamations) => {
      this.stats.reclamations = reclamations.filter(r => r.status === 'Pending').length;
      this.recentReclamations = reclamations.slice(-5).reverse();
      this.isLoading = false;
    });
  }
}
