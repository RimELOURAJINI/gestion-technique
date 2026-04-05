import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Project, Team, User, Reclamation } from '../../models/models';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AiService } from '../../services/ai.service';
import { FormsModule } from '@angular/forms';

declare var initDashboardCharts: any;

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class AdminOverviewComponent implements OnInit, AfterViewInit {
  stats = {
    projects: 0,
    teams: 0,
    managers: 0,
    reclamations: 0
  };
  recentProjects: Project[] = [];
  recentReclamations: Reclamation[] = [];
  isLoading = true;
  today: Date = new Date();

  isAiLoading = false;
  aiMessage = '';
  
  // Nouveaux paramètres pour aide à la décision
  riskThreshold: number = 80;
  totalReclamations = 0;
  resolvedReclamations = 0;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private aiService: AiService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  ngAfterViewInit() {
    // Small delay to ensure DOM is fully rendered before chart init
    setTimeout(() => {
      if (typeof initDashboardCharts === 'function') {
        initDashboardCharts();
      }
    }, 500);
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
      this.totalReclamations = reclamations.length;
      this.resolvedReclamations = reclamations.filter(r => r.status && r.status !== 'PENDING').length;
      
      this.stats.reclamations = reclamations.filter(r => r.status === 'PENDING').length;
      this.recentReclamations = reclamations.slice(-5).reverse();
      this.isLoading = false;
    });
  }

  refreshAiStats() {
    const userId = this.authService.getUserId();
    if (!userId) return;
    
    this.isAiLoading = true;
    this.aiMessage = '';
    
    // Injection du contexte calculé par le Frontend
    const extraContext = `\n[Données Avancées Frontend: Total Réclamations=${this.totalReclamations}, Résolues=${this.resolvedReclamations}. Seuil de risque budgétaire toléré par l'Administrateur=${this.riskThreshold}%]\n`;
    const prompt = `En tant qu'Assistant Décisionnel IA, analyse les risques de dépassement budgétaire (utilise le seuil de ${this.riskThreshold}%) et la santé globale (basé sur le SAV). Donne 3 alertes concrètes de réattribution de moyens s'il y a un danger financier ou humain.${extraContext}`;

    this.aiService.getAIStatisticsStream(userId, prompt).subscribe({
      next: (chunk) => {
        this.isAiLoading = false;
        this.aiMessage += chunk;
      },
      error: (err) => {
        this.isAiLoading = false;
        console.error('AI Error:', err);
        if(!this.aiMessage) this.aiMessage = "Erreur de connexion à l'Agent IA.";
      },
      complete: () => {
        this.isAiLoading = false;
      }
    });
  }
}
