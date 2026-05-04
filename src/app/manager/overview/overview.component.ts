import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamLeaderService } from '../../services/manager.service';
import { StatsService } from '../../services/stats.service';
import { AuthService } from '../../services/auth.service';
import { Project, Task, User, Team } from '../../models/models';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AiService } from '../../services/ai.service';
import { PersonalPointageComponent } from '../../shared/personal-pointage/personal-pointage.component';
import { ProjectSupportModalComponent } from '../../shared/project-support-modal/project-support-modal.component';
import { DealService } from '../../services/deal.service';

declare var initDashboardCharts: any;
declare var ApexCharts: any;

@Component({
  selector: 'app-manager-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, PersonalPointageComponent, ProjectSupportModalComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class ManagerOverviewComponent implements OnInit, AfterViewInit {
  stats = {
    projects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
    pipelineValue: 0,
    winRate: 0,
    priorityLevel: '',
    riskThreshold: 0,
    teams: [] as Team[],
    manager: {} as User,
    client: {} as User,
    commercial: {} as User
  };
  isCommercialLeader: boolean = false;
  today: Date = new Date();
  myProjects: Project[] = [];
  basePath: string = '/manager';
  recentTasks: Task[] = [];
  isLoading = true;

  isAiLoading = false;
  aiMessage = '';
  
  showSupportModal = false;
  selectedProject: any = null;

  // Nouveaux paramètres contextuels (Prévention & Goulots)
  workloadStr = '';
  blockedStr = '';

  constructor(
    private teamLeaderService: TeamLeaderService,
    private statsService: StatsService,
    private authService: AuthService,
    private aiService: AiService,
    private adminService: AdminService,
    private dealService: DealService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isCommercialLeader = this.authService.isCommercialLeader();
    this.basePath = this.isCommercialLeader ? '/commercial-leader' : '/manager';
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Small delay to ensure DOM is fully rendered before chart init
    setTimeout(() => {
      if (typeof initDashboardCharts === 'function') {
        initDashboardCharts();
      }
      this.renderTeamPerformanceChart();
    }, 800);
  }


  loadDashboardData() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.isLoading = true;

    // Load Deals if Commercial Leader
    if (this.isCommercialLeader) {
        this.dealService.getDealsForLeader().subscribe(deals => {
            this.stats.pipelineValue = deals.reduce((acc, deal) => acc + (deal.budget || 0), 0);
            const wonDeals = deals.filter(d => d.status === 'WON').length;
            this.stats.winRate = deals.length > 0 ? Math.round((wonDeals / deals.length) * 100) : 0;
            // Re-render chart if data changed
            this.renderTeamPerformanceChart();
        });
    }

    // Load Real Stats for Cards
    this.statsService.getManagerDashboardStats(userId).subscribe({
      next: (data) => {
        this.stats.projects = data.projectCount;
        this.stats.activeTasks = data.activeTaskCount;
        this.stats.teamMembers = data.memberCount;
        
        // Special logic for Commercial Leader: Team members count = total commercials
        if (this.authService.isCommercialLeader()) {
            this.adminService.getUsersByRole('COMMERCIAL').subscribe(users => {
                this.stats.teamMembers = users.length;
            });
        }
        this.renderTeamPerformanceChart();
      },
      error: (err) => console.error('Error loading manager dashboard stats:', err)
    });

    // Load Manager's Team / Commercial Force
    if (this.authService.isCommercialLeader()) {
        this.adminService.getUsersByRole('COMMERCIAL').subscribe({
            next: (users) => {
                // member count handled above but ensure it here too for consistency
                this.stats.teamMembers = users.length;
            },
            error: (err) => console.log('Error loading commercials for leaderboard:', err)
        });
    } else {
        this.teamLeaderService.getMyTeam(userId).subscribe({
            next: (team) => {
              if (team && team.users) {
                if (this.stats.teamMembers === 0) this.stats.teamMembers = team.users.length;
              }
            },
            error: (err) => console.log('Manager has no direct team assigned:', err)
        });
    }
    
    // Load Projects
    this.teamLeaderService.getProjectsByUserId(userId).subscribe(projects => {
      this.myProjects = projects;
      // Only count ongoing projects for the dashboard stat card
      this.stats.projects = projects.filter(p => {
          const s = (p.status || '').toUpperCase();
          return s !== 'COMPLETED' && s !== 'DONE' && s !== 'TERMINE' && s !== 'TERMINEE' && s !== 'DELIVERED';
      }).length;
      
      let allTasks: Task[] = [];
      let projectsProcessed = 0;

      if (projects.length === 0) {
        this.isLoading = false;
        return;
      }

      projects.forEach(p => {
        this.teamLeaderService.getTasksByProjectId(p.id).subscribe(tasks => {
          allTasks = [...allTasks, ...tasks];
          projectsProcessed++;

          if (projectsProcessed === projects.length) {
            this.stats.activeTasks = allTasks.filter(t => t.status !== 'DONE' && t.status !== 'COMPLETED').length;
            this.stats.completedTasks = allTasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
            this.recentTasks = allTasks.slice(-5).reverse();
            
            // member count handled by getMyTeam/isCommercialLeader logic above
            // fallback if not assigned a team but has projects:
            if (this.stats.teamMembers === 0 && !this.authService.isCommercialLeader()) {
              const memberIds = new Set();
              projects.forEach(proj => {
                proj.teams?.[0]?.users?.forEach((u: any) => memberIds.add(u.id));
              });
              this.stats.teamMembers = memberIds.size;
            }

            // IA Décisionnelle : Calcul de la surcharge ponctuelle et identification des blocages
            const workloadMap = new Map<string, number>();
            const blockedTasks: string[] = [];
            
            allTasks.forEach(t => {
                if (t.status !== 'DONE' && t.status !== 'COMPLETED') {
                    if (t.isBlocked) {
                        blockedTasks.push(`'${t.title}' (Raison: ${t.blockerReason || 'inconnue'})`);
                    }
                    if (t.users && t.users.length > 0) {
                        t.users.forEach((u: any) => {
                            const name = u.firstName;
                            const current = workloadMap.get(name) || 0;
                            workloadMap.set(name, current + (t.estimatedHours || 0));
                        });
                    }
                }
            });

            let wStr = '';
            workloadMap.forEach((hours, name) => wStr += `${name}: ${hours}h, `);
            this.workloadStr = wStr ? wStr.slice(0, -2) : 'Aucune charge active.';
            this.blockedStr = blockedTasks.length > 0 ? blockedTasks.join(', ') : 'Aucune tâche bloquée.';
            
            this.renderTeamPerformanceChart();
            this.isLoading = false;
          }
        });
      });
    });
  }

  renderTeamPerformanceChart() {
    if (typeof ApexCharts === 'undefined') return;

    const chartId = "team-performance-chart";
    const ctx = document.getElementById(chartId);
    if (!ctx) return;

    ctx.innerHTML = '';

    const series = [
      {
        name: 'Tâches Actives',
        data: [this.stats.activeTasks, Math.round(this.stats.activeTasks * 0.8), Math.round(this.stats.activeTasks * 1.2), this.stats.activeTasks, Math.round(this.stats.activeTasks * 0.9), Math.round(this.stats.activeTasks * 1.1), this.stats.activeTasks]
      },
      {
        name: 'Tâches Terminées',
        data: [this.stats.completedTasks, Math.round(this.stats.completedTasks * 0.7), Math.round(this.stats.completedTasks * 1.3), this.stats.completedTasks, Math.round(this.stats.completedTasks * 0.8), Math.round(this.stats.completedTasks * 1.2), this.stats.completedTasks]
      }
    ];

    const options = {
      chart: {
        height: 300,
        type: 'area',
        toolbar: { show: false },
        fontFamily: 'Poppins, sans-serif'
      },
      colors: ['#4361ee', '#27AE60'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      series: series,
      xaxis: {
        categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [20, 100, 100, 100]
        }
      },
      tooltip: {
        x: { format: 'dd/MM/yy HH:mm' },
      },
    };

    new ApexCharts(ctx, options).render();
  }

  refreshAiStats() {
    const userId = this.authService.getUserId();
    if (!userId) return;
    
    console.log(`[AI-INSIGHTS] 🚀 Génération analyse - userId: ${userId} - mode: insights`);
    this.isAiLoading = true;
    this.aiMessage = '';
    
    this.aiService.getAIStatisticsStream(userId, '', 'insights').subscribe({
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
  openProjectTickets(project: any) {
    this.selectedProject = project;
    this.showSupportModal = true;
  }
}
